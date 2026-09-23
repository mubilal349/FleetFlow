import { Schema, model, type InferSchemaType } from "mongoose";

const vehicleLocationSchema = new Schema(
  {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

const insuranceSchema = new Schema(
  {
    provider: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    policyNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    expiryDate: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const vehicleSchema = new Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    make: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    year: {
      type: Number,
      required: true,
      min: 1900,
      max: 2100,
    },

    vehicleType: {
      type: String,
      required: true,
      enum: [
        "car",
        "van",
        "pickup",
        "truck",
        "bus",
        "motorcycle",
        "trailer",
        "other",
      ],
      index: true,
    },

    color: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    status: {
      type: String,
      required: true,
      enum: ["available", "assigned", "in_trip", "maintenance", "inactive"],
      default: "available",
      index: true,
    },

    fuelType: {
      type: String,
      required: true,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng", "lpg", "other"],
    },

    fuelCapacity: {
      type: Number,
      min: 0,
    },

    currentMileage: {
      type: Number,
      min: 0,
      default: 0,
    },

    driverId: {
      type: String,
      default: null,
      index: true,
    },

    location: {
      type: vehicleLocationSchema,
      default: null,
    },

    purchaseDate: {
      type: Date,
    },

    purchasePrice: {
      type: Number,
      min: 0,
    },

    insurance: {
      type: insuranceSchema,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*

* A registration number must be unique inside an organization.
*
* This allows different organizations to have vehicles with
* the same registration number while preventing duplicates
* within the same organization.
  */
vehicleSchema.index(
  {
    organizationId: 1,
    registrationNumber: 1,
  },
  {
    unique: true,
  },
);

vehicleSchema.index({
  organizationId: 1,
  status: 1,
});

vehicleSchema.index({
  organizationId: 1,
  vehicleType: 1,
});

vehicleSchema.index({
  organizationId: 1,
  driverId: 1,
});

export type Vehicle = InferSchemaType<typeof vehicleSchema>;

export const VehicleModel = model<Vehicle>("Vehicle", vehicleSchema);
