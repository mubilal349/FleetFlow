"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var serviceSchema = new mongoose_1.Schema({
    vehicleId: {
        type: String,
        required: true,
        trim: true,
    },
    serviceType: {
        type: String,
        enum: [
            "routine_service",
            "oil_change",
            "tire_change",
            "brake_service",
            "engine_repair",
            "inspection",
            "other",
        ],
        required: true,
    },
    serviceDate: {
        type: Date,
        required: true,
    },
    nextServiceDate: {
        type: Date,
    },
    mileage: {
        type: Number,
        required: true,
        min: 0,
    },
    cost: {
        type: Number,
        required: true,
        min: 0,
    },
    serviceProvider: {
        type: String,
        trim: true,
        maxlength: 200,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 5000,
    },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "cancelled"],
        default: "scheduled",
    },
    createdBy: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
serviceSchema.index({ vehicleId: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ serviceDate: -1 });
var ServiceModel = mongoose_1.default.model("Service", serviceSchema);
exports.default = ServiceModel;
