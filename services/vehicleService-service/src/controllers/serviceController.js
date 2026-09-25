"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.serviceController = void 0;
var serviceSchema_js_1 = require("../schemas/serviceSchema.js");
var serviceService_js_1 = require("../services/serviceService.js");
var ServiceController = /** @class */ (function () {
    function ServiceController() {
    }
    /**
     * Create service record
     * POST /services
     */
    ServiceController.prototype.createService = function (request, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var result, body, createdBy, service, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        result = serviceSchema_js_1.createServiceSchema.safeParse({
                            body: request.body,
                        });
                        if (!result.success) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Validation failed",
                                    errors: result.error.flatten(),
                                })];
                        }
                        body = result.data.body;
                        createdBy = ((_a = request.user) === null || _a === void 0 ? void 0 : _a.id) ||
                            body.createdBy;
                        if (!createdBy) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Created by user ID is required",
                                })];
                        }
                        return [4 /*yield*/, serviceService_js_1.serviceService.createService(__assign(__assign({}, body), { createdBy: createdBy }))];
                    case 1:
                        service = _b.sent();
                        return [2 /*return*/, reply.status(201).send({
                                success: true,
                                message: "Vehicle service record created successfully",
                                data: service,
                            })];
                    case 2:
                        error_1 = _b.sent();
                        if (error_1 instanceof serviceService_js_1.ServiceServiceError) {
                            return [2 /*return*/, reply.status(error_1.statusCode).send({
                                    success: false,
                                    message: error_1.message,
                                })];
                        }
                        request.log.error(error_1);
                        return [2 /*return*/, reply.status(500).send({
                                success: false,
                                message: "Failed to create service record",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all service records
     * GET /services
     */
    ServiceController.prototype.getServices = function (request, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var result, services, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        result = serviceSchema_js_1.listServicesQuerySchema.safeParse({
                            query: request.query,
                        });
                        if (!result.success) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Invalid query parameters",
                                    errors: result.error.flatten(),
                                })];
                        }
                        return [4 /*yield*/, serviceService_js_1.serviceService.getServices(result.data.query)];
                    case 1:
                        services = _a.sent();
                        return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: "Service records fetched successfully",
                                data: services,
                            })];
                    case 2:
                        error_2 = _a.sent();
                        request.log.error(error_2);
                        return [2 /*return*/, reply.status(500).send({
                                success: false,
                                message: "Failed to fetch service records",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get one service record
     * GET /services/:id
     */
    ServiceController.prototype.getServiceById = function (request, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var result, service, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        result = serviceSchema_js_1.serviceIdParamsSchema.safeParse({
                            params: request.params,
                        });
                        if (!result.success) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Invalid service ID",
                                    errors: result.error.flatten(),
                                })];
                        }
                        return [4 /*yield*/, serviceService_js_1.serviceService.getServiceById(result.data.params.id)];
                    case 1:
                        service = _a.sent();
                        return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: "Service record fetched successfully",
                                data: service,
                            })];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof serviceService_js_1.ServiceServiceError) {
                            return [2 /*return*/, reply.status(error_3.statusCode).send({
                                    success: false,
                                    message: error_3.message,
                                })];
                        }
                        request.log.error(error_3);
                        return [2 /*return*/, reply.status(500).send({
                                success: false,
                                message: "Failed to fetch service record",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update service record
     * PATCH /services/:id
     */
    ServiceController.prototype.updateService = function (request, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var result, updatedService, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        result = serviceSchema_js_1.updateServiceSchema.safeParse({
                            params: request.params,
                            body: request.body,
                        });
                        if (!result.success) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Validation failed",
                                    errors: result.error.flatten(),
                                })];
                        }
                        return [4 /*yield*/, serviceService_js_1.serviceService.updateService(result.data.params.id, result.data.body)];
                    case 1:
                        updatedService = _a.sent();
                        return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: "Vehicle service record updated successfully",
                                data: updatedService,
                            })];
                    case 2:
                        error_4 = _a.sent();
                        if (error_4 instanceof serviceService_js_1.ServiceServiceError) {
                            return [2 /*return*/, reply.status(error_4.statusCode).send({
                                    success: false,
                                    message: error_4.message,
                                })];
                        }
                        request.log.error(error_4);
                        return [2 /*return*/, reply.status(500).send({
                                success: false,
                                message: "Failed to update service record",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete service record
     * DELETE /services/:id
     */
    ServiceController.prototype.deleteService = function (request, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        result = serviceSchema_js_1.serviceIdParamsSchema.safeParse({
                            params: request.params,
                        });
                        if (!result.success) {
                            return [2 /*return*/, reply.status(400).send({
                                    success: false,
                                    message: "Invalid service ID",
                                    errors: result.error.flatten(),
                                })];
                        }
                        return [4 /*yield*/, serviceService_js_1.serviceService.deleteService(result.data.params.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: "Vehicle service record deleted successfully",
                            })];
                    case 2:
                        error_5 = _a.sent();
                        if (error_5 instanceof serviceService_js_1.ServiceServiceError) {
                            return [2 /*return*/, reply.status(error_5.statusCode).send({
                                    success: false,
                                    message: error_5.message,
                                })];
                        }
                        request.log.error(error_5);
                        return [2 /*return*/, reply.status(500).send({
                                success: false,
                                message: "Failed to delete service record",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ServiceController;
}());
exports.serviceController = new ServiceController();
