import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

import {
  driverService,
  type CreateDriverInput,
  type UpdateDriverInput,
} from "../services/driverService.js";

import type { DriverStatus } from "../models/Driver.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

export interface DriverParams {
  id: string;
}

export interface DriverQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: DriverStatus;
}

export interface StatusBody {
  status: DriverStatus;
}

function getOrganizationId(request: FastifyRequest): string {
  const user = request.user as AuthenticatedUser | undefined;
  return user?.organizationId || user?.orgId || "org-demo-001";
}

function getUserId(request: FastifyRequest): string {
  const user = request.user as AuthenticatedUser | undefined;
  return user?.id || "system";
}

export async function createDriverController(
  request: FastifyRequest<{ Body: CreateDriverInput }>,
  reply: FastifyReply,
) {
  try {
    const driver = await driverService.createDriver(
      request.body,
      getOrganizationId(request),
      getUserId(request),
    );

    return reply.code(201).send({
      success: true,
      message: "Driver created successfully",
      data: driver,
    });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to create driver",
    });
  }
}

export async function getDriversController(
  request: FastifyRequest<{ Querystring: DriverQuery }>,
  reply: FastifyReply,
) {
  try {
    const { page = "1", limit = "10", search, status } = request.query;
    const result = await driverService.getDrivers(getOrganizationId(request), {
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });

    return reply.send({ success: true, ...result });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to retrieve drivers",
    });
  }
}

export async function getDriverController(
  request: FastifyRequest<{ Params: DriverParams }>,
  reply: FastifyReply,
) {
  try {
    const driver = await driverService.getDriver(
      request.params.id,
      getOrganizationId(request),
    );
    return reply.send({ success: true, data: driver });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to retrieve driver",
    });
  }
}

export async function updateDriverController(
  request: FastifyRequest<{
    Params: DriverParams;
    Body: UpdateDriverInput;
  }>,
  reply: FastifyReply,
) {
  try {
    const driver = await driverService.updateDriver(
      request.params.id,
      getOrganizationId(request),
      request.body,
    );
    return reply.send({
      success: true,
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to update driver",
    });
  }
}

export async function uploadDriverProfileImageController(
  request: FastifyRequest<{ Params: DriverParams }>,
  reply: FastifyReply,
) {
  let savedFilePath: string | undefined;

  try {
    const driverId = request.params.id;
    const organizationId = getOrganizationId(request);

    await driverService.getDriver(driverId, organizationId);

    const file = await request.file();

    if (!file) {
      return reply.code(400).send({
        success: false,
        message: "Please select a profile image",
      });
    }

    const extensions: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = extensions[file.mimetype];

    if (!extension) {
      await file.toBuffer();
      return reply.code(400).send({
        success: false,
        message: "Only JPG, PNG, and WebP images are allowed",
      });
    }

    const buffer = await file.toBuffer();

    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return reply.code(400).send({
        success: false,
        message: "Image must be between 1 byte and 5 MB",
      });
    }

    const isJpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const isPng =
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

    const isWebp =
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    const validImage =
      (file.mimetype === "image/jpeg" && isJpeg) ||
      (file.mimetype === "image/png" && isPng) ||
      (file.mimetype === "image/webp" && isWebp);

    if (!validImage) {
      return reply.code(400).send({
        success: false,
        message: "The uploaded file is not a valid supported image",
      });
    }

    const uploadDirectory = path.resolve(process.cwd(), "uploads", "drivers");

    await mkdir(uploadDirectory, { recursive: true });

    const filename = `${randomUUID()}${extension}`;
    savedFilePath = path.join(uploadDirectory, filename);

    await writeFile(savedFilePath, buffer, { flag: "wx" });

    const publicBaseUrl = (
      process.env.DRIVER_PUBLIC_URL || "http://localhost:4009"
    ).replace(/\/+$/, "");

    const profileImage = `${publicBaseUrl}/uploads/drivers/${filename}`;

    const driver = await driverService.updateDriverProfileImage(
      driverId,
      organizationId,
      profileImage,
    );

    return reply.send({
      success: true,
      message: "Driver profile image uploaded successfully",
      data: driver,
    });
  } catch (error: unknown) {
    if (savedFilePath) {
      await unlink(savedFilePath).catch(() => undefined);
    }

    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to upload driver profile image",
    });
  }
}

export async function updateDriverStatusController(
  request: FastifyRequest<{
    Params: DriverParams;
    Body: StatusBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const driver = await driverService.updateDriverStatus(
      request.params.id,
      getOrganizationId(request),
      request.body.status,
    );
    return reply.send({
      success: true,
      message: "Driver status updated successfully",
      data: driver,
    });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to update driver status",
    });
  }
}

export async function deleteDriverController(
  request: FastifyRequest<{ Params: DriverParams }>,
  reply: FastifyReply,
) {
  try {
    await driverService.deleteDriver(
      request.params.id,
      getOrganizationId(request),
    );
    return reply.send({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error: unknown) {
    request.log.error(error);
    const err = error as Error & { statusCode?: number };
    return reply.code(err.statusCode || 500).send({
      success: false,
      message: err.message || "Failed to delete driver",
    });
  }
}
