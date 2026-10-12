import mongoose, { type Document, type Model } from "mongoose";

export type DriverStatus =
  | "available"
  | "on_trip"
  | "off_duty"
  | "suspended"
  | "inactive";

export type LicenseType =
  | "car"
  | "ltv"
  | "htv"
  | "motorcycle"
  | "bus"
  | "other";

export interface IDriver {
  organizationId: string;

  firstName: string;
  lastName: string;

  email?: string;
  phone: string;

  // Driver profile photo URL or storage path
  profileImage?: string;

  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: Date;

  dateOfBirth?: Date;

  address?: string;

  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };

  joiningDate?: Date;

  status: DriverStatus;

  createdBy: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface DriverDocument extends IDriver, Document {}

const driverSchema = new mongoose.Schema<DriverDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      trim: true,
      default: undefined,
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    licenseType: {
      type: String,
      enum: ["car", "ltv", "htv", "motorcycle", "bus", "other"],
      required: true,
    },

    licenseExpiry: {
      type: Date,
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      relationship: {
        type: String,
        trim: true,
      },
    },

    joiningDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["available", "on_trip", "off_duty", "suspended", "inactive"],
      default: "available",
      index: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

driverSchema.index({
  organizationId: 1,
  licenseNumber: 1,
});

driverSchema.index({
  organizationId: 1,
  email: 1,
});

driverSchema.index({
  organizationId: 1,
  status: 1,
});

driverSchema.index({
  organizationId: 1,
  firstName: 1,
  lastName: 1,
});

export const Driver: Model<DriverDocument> =
  mongoose.models.Driver ||
  mongoose.model<DriverDocument>("Driver", driverSchema);
