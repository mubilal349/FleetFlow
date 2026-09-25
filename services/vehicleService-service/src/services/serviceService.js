"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceService = exports.ServiceServiceError = void 0;
var serviceRepository_js_1 = require("../repositories/serviceRepository.js");
var ServiceServiceError = /** @class */ (function (_super) {
    __extends(ServiceServiceError, _super);
    function ServiceServiceError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = "ServiceServiceError";
        _this.statusCode = statusCode;
        return _this;
    }
    return ServiceServiceError;
}(Error));
exports.ServiceServiceError = ServiceServiceError;
var ServiceService = /** @class */ (function () {
    function ServiceService() {
    }
    /**
     * Create a new vehicle service record
     */
    ServiceService.prototype.createService = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var service;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data.vehicleId) {
                            throw new ServiceServiceError("Vehicle ID is required", 400);
                        }
                        if (!data.createdBy) {
                            throw new ServiceServiceError("Created by user ID is required", 400);
                        }
                        if (data.mileage < 0) {
                            throw new ServiceServiceError("Mileage cannot be negative", 400);
                        }
                        if (data.cost < 0) {
                            throw new ServiceServiceError("Cost cannot be negative", 400);
                        }
                        if (data.nextServiceDate && data.nextServiceDate < data.serviceDate) {
                            throw new ServiceServiceError("Next service date cannot be before service date", 400);
                        }
                        return [4 /*yield*/, serviceRepository_js_1.serviceRepository.create(data)];
                    case 1:
                        service = _a.sent();
                        return [2 /*return*/, service];
                }
            });
        });
    };
    /**
     * Get all vehicle service records
     */
    ServiceService.prototype.getServices = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, serviceRepository_js_1.serviceRepository.findAll(filters)];
            });
        });
    };
    /**
     * Get one service record
     */
    ServiceService.prototype.getServiceById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var service;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serviceRepository_js_1.serviceRepository.findById(id)];
                    case 1:
                        service = _a.sent();
                        if (!service) {
                            throw new ServiceServiceError("Service record not found", 404);
                        }
                        return [2 /*return*/, service];
                }
            });
        });
    };
    /**
     * Update a service record
     */
    ServiceService.prototype.updateService = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existingService, serviceDate, nextServiceDate, updatedService;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, serviceRepository_js_1.serviceRepository.findById(id)];
                    case 1:
                        existingService = _c.sent();
                        if (!existingService) {
                            throw new ServiceServiceError("Service record not found", 404);
                        }
                        if (data.mileage !== undefined && data.mileage < 0) {
                            throw new ServiceServiceError("Mileage cannot be negative", 400);
                        }
                        if (data.cost !== undefined && data.cost < 0) {
                            throw new ServiceServiceError("Cost cannot be negative", 400);
                        }
                        serviceDate = (_a = data.serviceDate) !== null && _a !== void 0 ? _a : existingService.serviceDate;
                        nextServiceDate = (_b = data.nextServiceDate) !== null && _b !== void 0 ? _b : existingService.nextServiceDate;
                        if (nextServiceDate && nextServiceDate < serviceDate) {
                            throw new ServiceServiceError("Next service date cannot be before service date", 400);
                        }
                        return [4 /*yield*/, serviceRepository_js_1.serviceRepository.update(id, data)];
                    case 2:
                        updatedService = _c.sent();
                        if (!updatedService) {
                            throw new ServiceServiceError("Unable to update service record", 500);
                        }
                        return [2 /*return*/, updatedService];
                }
            });
        });
    };
    /**
     * Delete a service record
     */
    ServiceService.prototype.deleteService = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var existingService, deletedService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serviceRepository_js_1.serviceRepository.findById(id)];
                    case 1:
                        existingService = _a.sent();
                        if (!existingService) {
                            throw new ServiceServiceError("Service record not found", 404);
                        }
                        return [4 /*yield*/, serviceRepository_js_1.serviceRepository.delete(id)];
                    case 2:
                        deletedService = _a.sent();
                        if (!deletedService) {
                            throw new ServiceServiceError("Unable to delete service record", 500);
                        }
                        return [2 /*return*/, deletedService];
                }
            });
        });
    };
    return ServiceService;
}());
exports.serviceService = new ServiceService();
