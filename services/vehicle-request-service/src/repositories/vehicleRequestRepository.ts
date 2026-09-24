import {
  VehicleRequestModel,
  type VehicleRequestDocument,
  type VehicleRequestStatus,
} from "../models/vehicleRequestModel.js";

export async function createVehicleRequest(
  data: Partial<VehicleRequestDocument>,
) {
  return VehicleRequestModel.create(data);
}

export async function findVehicleRequestById(id: string) {
  return VehicleRequestModel.findById(id).lean();
}

export async function findCustomerRequests(
  organizationId: string,
  customerId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const filter = {
    organizationId,
    customerId,
  };

  const [requests, total] = await Promise.all([
    VehicleRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    VehicleRequestModel.countDocuments(filter),
  ]);

  return {
    requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateVehicleRequestStatus(
  id: string,
  status: VehicleRequestStatus,
  extraData: Partial<VehicleRequestDocument> = {},
) {
  return VehicleRequestModel.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        ...extraData,
      },
    },
    {
      new: true,
    },
  ).lean();
}

export async function findRequestForCustomer(
  id: string,
  organizationId: string,
  customerId: string,
) {
  return VehicleRequestModel.findOne({
    _id: id,
    organizationId,
    customerId,
  }).lean();
}
