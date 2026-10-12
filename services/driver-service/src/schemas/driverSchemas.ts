export const createDriverSchema = {
  body: {
    type: "object",
    required: [
      "firstName",
      "lastName",
      "phone",
      "licenseNumber",
      "licenseType",
      "licenseExpiry",
    ],
    properties: {
      firstName: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },

      lastName: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },

      email: {
        type: "string",
        format: "email",
      },

      phone: {
        type: "string",
        minLength: 5,
        maxLength: 30,
      },

      licenseNumber: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },

      licenseType: {
        type: "string",
        enum: ["car", "ltv", "htv", "motorcycle", "bus", "other"],
      },

      licenseExpiry: {
        type: "string",
      },

      dateOfBirth: {
        type: "string",
      },

      address: {
        type: "string",
        maxLength: 500,
      },

      emergencyContact: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },

          phone: {
            type: "string",
          },

          relationship: {
            type: "string",
          },
        },
      },

      joiningDate: {
        type: "string",
      },

      status: {
        type: "string",
        enum: ["available", "on_trip", "off_duty", "suspended", "inactive"],
      },
    },
  },
};

export const updateDriverSchema = {
  body: {
    type: "object",
    properties: {
      firstName: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },

      lastName: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },

      email: {
        type: "string",
        format: "email",
      },

      phone: {
        type: "string",
      },

      licenseNumber: {
        type: "string",
      },

      licenseType: {
        type: "string",
        enum: ["car", "ltv", "htv", "motorcycle", "bus", "other"],
      },

      licenseExpiry: {
        type: "string",
      },

      dateOfBirth: {
        type: "string",
      },

      address: {
        type: "string",
      },

      emergencyContact: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },

          phone: {
            type: "string",
          },

          relationship: {
            type: "string",
          },
        },
      },

      joiningDate: {
        type: "string",
      },

      status: {
        type: "string",
        enum: ["available", "on_trip", "off_duty", "suspended", "inactive"],
      },
    },
  },
};

export const updateDriverStatusSchema = {
  body: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["available", "on_trip", "off_duty", "suspended", "inactive"],
      },
    },
  },
};
