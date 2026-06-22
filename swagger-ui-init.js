
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "App"
          ]
        }
      },
      "/health": {
        "get": {
          "operationId": "HealthController_checkHealth",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Service is healthy"
            }
          },
          "summary": "Check if the API and Database are healthy",
          "tags": [
            "Health"
          ]
        }
      },
      "/auth/register/super-admin": {
        "post": {
          "operationId": "AuthController_registerSuperAdmin",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegisterSuperAdminDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "The super admin has been successfully created."
            },
            "409": {
              "description": "Username already exists."
            }
          },
          "summary": "Register a new Super Admin",
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginSuperAdminDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successful login."
            },
            "401": {
              "description": "Invalid credentials."
            }
          },
          "summary": "Central Login",
          "tags": [
            "Auth"
          ]
        }
      },
      "/school": {
        "post": {
          "operationId": "SchoolController_createSchool",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSchoolDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Register a new school (Super Admin only)",
          "tags": [
            "School"
          ]
        },
        "get": {
          "operationId": "SchoolController_listSchools",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "isActive",
              "required": false,
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "city",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "name",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolCode",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolBoard",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List schools with pagination",
          "tags": [
            "School"
          ]
        }
      },
      "/school/{id}": {
        "put": {
          "operationId": "SchoolController_updateSchool",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSchoolDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update school details (Super Admin, School Admin)",
          "tags": [
            "School"
          ]
        },
        "get": {
          "operationId": "SchoolController_getSchool",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "School UUID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get school details by ID (includes contact, owner details and signed profile URLs)",
          "tags": [
            "School"
          ]
        }
      },
      "/school/{id}/profile-image": {
        "put": {
          "operationId": "SchoolController_updateProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add or update school profile image",
          "tags": [
            "School"
          ]
        },
        "delete": {
          "operationId": "SchoolController_deleteProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete school profile image",
          "tags": [
            "School"
          ]
        }
      },
      "/school/{id}/owner-profile-image": {
        "put": {
          "operationId": "SchoolController_updateOwnerProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "description": "School UUID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add or update school owner profile image",
          "tags": [
            "School"
          ]
        }
      },
      "/school/classes": {
        "post": {
          "operationId": "SchoolController_createClasses",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateClassesDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Bulk create classes for the school",
          "tags": [
            "School"
          ]
        }
      },
      "/school/classes/{id}": {
        "put": {
          "operationId": "SchoolController_updateClass",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateClassDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a class",
          "tags": [
            "School"
          ]
        }
      },
      "/school/fetch/classes": {
        "get": {
          "operationId": "SchoolController_listClasses",
          "parameters": [
            {
              "name": "schoolId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List all classes for the school",
          "tags": [
            "School"
          ]
        }
      },
      "/school/sections": {
        "post": {
          "operationId": "SchoolController_createSections",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSectionsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Bulk create sections for the school",
          "tags": [
            "School"
          ]
        }
      },
      "/school/sections/{id}": {
        "put": {
          "operationId": "SchoolController_updateSection",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSectionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a section",
          "tags": [
            "School"
          ]
        }
      },
      "/school/fetch/sections": {
        "get": {
          "operationId": "SchoolController_listSections",
          "parameters": [
            {
              "name": "schoolId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List sections for the school, optionally filtered by classId",
          "tags": [
            "School"
          ]
        }
      },
      "/file-upload": {
        "post": {
          "operationId": "FileUploadController_uploadFile",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Upload a file to storage",
          "tags": [
            "File Upload"
          ]
        }
      },
      "/file-upload/get-url": {
        "get": {
          "operationId": "FileUploadController_getFile",
          "parameters": [
            {
              "name": "filePath",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get a file from storage using its key",
          "tags": [
            "File Upload"
          ]
        }
      },
      "/administrator": {
        "post": {
          "operationId": "AdministratorController_createAdministrator",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAdministratorDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create a new administrator (creates User + AdministratorDtls)",
          "tags": [
            "Administrator"
          ]
        },
        "get": {
          "operationId": "AdministratorController_listAdministrators",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "schoolName",
              "required": false,
              "in": "query",
              "description": "Filter by school name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "administratorName",
              "required": false,
              "in": "query",
              "description": "Filter by administrator name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "administratorPhone",
              "required": false,
              "in": "query",
              "description": "Filter by administrator phone",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolCode",
              "required": false,
              "in": "query",
              "description": "Filter by school code",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List administrators with pagination and filters",
          "tags": [
            "Administrator"
          ]
        }
      },
      "/administrator/{id}": {
        "put": {
          "operationId": "AdministratorController_updateAdministrator",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateAdministratorDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update administrator details",
          "tags": [
            "Administrator"
          ]
        }
      },
      "/administrator/{id}/profile-image": {
        "put": {
          "operationId": "AdministratorController_updateProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add or update administrator profile image",
          "tags": [
            "Administrator"
          ]
        },
        "delete": {
          "operationId": "AdministratorController_deleteProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete administrator profile image",
          "tags": [
            "Administrator"
          ]
        }
      },
      "/administrator/session": {
        "post": {
          "operationId": "AdministratorController_addSession",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add a new session",
          "tags": [
            "Administrator"
          ]
        },
        "get": {
          "operationId": "AdministratorController_getSessions",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List all sessions",
          "tags": [
            "Administrator"
          ]
        }
      },
      "/teacher/register": {
        "post": {
          "operationId": "TeacherController_registerTeacher",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateTeacherDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Register a new teacher (creates User, TeacherDtls, SchoolRecord, Classes)",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/{id}/details": {
        "put": {
          "operationId": "TeacherController_updateTeacherDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeacherDtlsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update teacher basic & personal details",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/{id}/profile-image": {
        "put": {
          "operationId": "TeacherController_updateProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add or update teacher profile image",
          "tags": [
            "Teacher"
          ]
        },
        "delete": {
          "operationId": "TeacherController_deleteProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete teacher profile image",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/{id}/address": {
        "post": {
          "operationId": "TeacherController_addAddress",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateTeacherAddressDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add address to teacher",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/address/{addressId}": {
        "put": {
          "operationId": "TeacherController_updateAddress",
          "parameters": [
            {
              "name": "addressId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeacherAddressDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update specific address using addressId",
          "tags": [
            "Teacher"
          ]
        },
        "delete": {
          "operationId": "TeacherController_deleteAddress",
          "parameters": [
            {
              "name": "addressId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete specific address using addressId",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/school-record/{recordId}": {
        "put": {
          "operationId": "TeacherController_updateSchoolRecord",
          "parameters": [
            {
              "name": "recordId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeacherSchoolRecordDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update teacher school record using recordId",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher": {
        "get": {
          "operationId": "TeacherController_listTeachers",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "schoolId",
              "required": false,
              "in": "query",
              "description": "Filter by school ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "className",
              "required": false,
              "in": "query",
              "description": "Filter by class name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "firstName",
              "required": false,
              "in": "query",
              "description": "Filter by teacher first name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "mobileNumber",
              "required": false,
              "in": "query",
              "description": "Filter by mobile number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "username",
              "required": false,
              "in": "query",
              "description": "Filter by username",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "employeeEmail",
              "required": false,
              "in": "query",
              "description": "Filter by employee email",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subjectName",
              "required": false,
              "in": "query",
              "description": "Filter by subject name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "isCoordinator",
              "required": false,
              "in": "query",
              "description": "Filter by is coordinator",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "teacherId",
              "required": false,
              "in": "query",
              "description": "Filter by teacher ID",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List teachers with pagination and filters",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/birthdays": {
        "get": {
          "operationId": "TeacherController_getTeacherBirthdays",
          "parameters": [
            {
              "name": "date",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get list of teachers whose birthday falls on the given date",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/{id}": {
        "get": {
          "operationId": "TeacherController_getTeacherDetails",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get complete teacher details including signed profile image URL",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/add-class-teacher": {
        "put": {
          "operationId": "TeacherController_addClassTeacher",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AddClassTeacherDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add class teacher to teacher",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/remove-class-teacher": {
        "delete": {
          "operationId": "TeacherController_removeClassTeacher",
          "parameters": [
            {
              "name": "className",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sectionName",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Remove class teacher assignment from class",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/coordinator-class": {
        "post": {
          "operationId": "TeacherController_addCoordinatorClass",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add a coordinator class mapping",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/teacher/coordinator-class/{mappingId}": {
        "delete": {
          "operationId": "TeacherController_removeCoordinatorClass",
          "parameters": [
            {
              "name": "mappingId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Remove a coordinator class mapping",
          "tags": [
            "Teacher"
          ]
        }
      },
      "/student/register": {
        "post": {
          "operationId": "StudentController_registerStudent",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateStudentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Register a new student (creates User & StudentDtls)",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/details": {
        "put": {
          "operationId": "StudentController_updateStudentDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentDtlsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update student basic details",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/profile-image": {
        "put": {
          "operationId": "StudentController_updateProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add or update student profile image",
          "tags": [
            "Student"
          ]
        },
        "delete": {
          "operationId": "StudentController_deleteProfileImage",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete student profile image",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/status": {
        "put": {
          "operationId": "StudentController_updateStudentStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentStatusDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update student active/inactive status",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/academic": {
        "post": {
          "operationId": "StudentController_addAcademicDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateStudentAcademicDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add academic details to student",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/academic/{academicId}": {
        "put": {
          "operationId": "StudentController_updateAcademicDtls",
          "parameters": [
            {
              "name": "academicId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentAcademicDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update specific academic details using academicId",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/parent": {
        "post": {
          "operationId": "StudentController_addParentDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateStudentParentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add parent details to student",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/parent/{parentId}": {
        "put": {
          "operationId": "StudentController_updateParentDtls",
          "parameters": [
            {
              "name": "parentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentParentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update specific parent details using parentId",
          "tags": [
            "Student"
          ]
        },
        "delete": {
          "operationId": "StudentController_deleteParentDtls",
          "parameters": [
            {
              "name": "parentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete specific parent details using parentId",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/medical": {
        "post": {
          "operationId": "StudentController_addMedicalHistory",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateMedicalHistoryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add medical history to student",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/medical/{medicalId}": {
        "put": {
          "operationId": "StudentController_updateMedicalHistory",
          "parameters": [
            {
              "name": "medicalId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateMedicalHistoryDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update specific medical history using medicalId",
          "tags": [
            "Student"
          ]
        },
        "delete": {
          "operationId": "StudentController_deleteMedicalHistory",
          "parameters": [
            {
              "name": "medicalId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete specific medical history using medicalId",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/{id}/address": {
        "post": {
          "operationId": "StudentController_addAddressDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateStudentAddressDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add address to student",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/address/{addressId}": {
        "put": {
          "operationId": "StudentController_updateAddressDtls",
          "parameters": [
            {
              "name": "addressId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentAddressDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update specific address using addressId",
          "tags": [
            "Student"
          ]
        },
        "delete": {
          "operationId": "StudentController_deleteAddressDtls",
          "parameters": [
            {
              "name": "addressId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete specific address using addressId",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/attendance/bulk": {
        "post": {
          "operationId": "StudentController_bulkAddAttendance",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BulkAddAttendanceDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add bulk attendance records",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/attendance/{recordId}": {
        "put": {
          "operationId": "StudentController_updateAttendance",
          "parameters": [
            {
              "name": "recordId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateAttendanceDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a specific attendance record",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/attendance/filter": {
        "get": {
          "operationId": "StudentController_fetchAttendance",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "description": "Academic session filter (e.g., 2024-2025)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date",
              "required": true,
              "in": "query",
              "description": "Date of attendance filter",
              "schema": {
                "example": "2023-10-25",
                "type": "string"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "description": "Class Section ID filter",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "teacherId",
              "required": false,
              "in": "query",
              "description": "Teacher ID filter (defaults to logged in user if not provided)",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Fetch attendance records based on filters",
          "tags": [
            "Student"
          ]
        }
      },
      "/student": {
        "get": {
          "operationId": "StudentController_listStudents",
          "parameters": [
            {
              "name": "schoolId",
              "required": false,
              "in": "query",
              "description": "Filter by school ID",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "firstName",
              "required": false,
              "in": "query",
              "description": "Search by first name",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "mobileNumber",
              "required": false,
              "in": "query",
              "description": "Search by mobile number",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "description": "Filter by class section ID",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "description": "Page number",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "description": "Page size",
              "schema": {
                "default": 10,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List students with pagination and filters",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/birthdays": {
        "get": {
          "operationId": "StudentController_getStudentBirthdays",
          "parameters": [
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get list of students whose birthday falls on the given date for a class section",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/details/{id}": {
        "get": {
          "operationId": "StudentController_getStudentDetails",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get complete student details including signed profile image URL",
          "tags": [
            "Student"
          ]
        }
      },
      "/student/basic-details": {
        "get": {
          "operationId": "StudentController_getStudentBasicDetails",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get basic student details including signed profile image URL",
          "tags": [
            "Student"
          ]
        }
      },
      "/class/class-dtls": {
        "post": {
          "operationId": "ClassController_createClassDtls",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateClassDtlsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create class details (map class teacher & strength)",
          "tags": [
            "Class"
          ]
        },
        "get": {
          "operationId": "ClassController_listClassDtls",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classTeacherId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List class details with enriched data",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/class-dtls/{id}": {
        "put": {
          "operationId": "ClassController_updateClassDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateClassDtlsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update class details (maxLimit or classTeacherId)",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/subject-dtls": {
        "post": {
          "operationId": "ClassController_createSubjectDtls",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSubjectDtlsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Bulk create subjects for the school",
          "tags": [
            "Class"
          ]
        },
        "get": {
          "operationId": "ClassController_listSubjectDtls",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "schoolId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "searchText",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List subjects by session and school",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/subject-dtls/{id}": {
        "put": {
          "operationId": "ClassController_updateSubjectDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSubjectDtlsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a subject",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/class-subject-dtls": {
        "post": {
          "operationId": "ClassController_createClassSubjectDtls",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateClassSubjectDtlsDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create/bulk create class-subject-teacher mappings",
          "tags": [
            "Class"
          ]
        },
        "get": {
          "operationId": "ClassController_listClassSubjectDtls",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "teacherId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "schoolId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List class-subject-teacher mappings with enriched data",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/class-subject-dtls/{id}": {
        "put": {
          "operationId": "ClassController_updateClassSubjectDtls",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateClassSubjectDtlsDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a class-subject-teacher mapping",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/period-slots": {
        "post": {
          "operationId": "ClassController_createPeriodSlot",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create period slots (bulk)",
          "tags": [
            "Class"
          ]
        },
        "get": {
          "operationId": "ClassController_listPeriodSlots",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List all period slots for a school",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/period-slots/{id}": {
        "put": {
          "operationId": "ClassController_updatePeriodSlot",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePeriodSlotDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a period slot",
          "tags": [
            "Class"
          ]
        },
        "delete": {
          "operationId": "ClassController_deletePeriodSlot",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete a period slot",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/timetable": {
        "post": {
          "operationId": "ClassController_createTimetable",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create timetable entries (bulk)",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/timetable/{id}": {
        "put": {
          "operationId": "ClassController_updateTimetable",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTimetableDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a timetable entry",
          "tags": [
            "Class"
          ]
        },
        "delete": {
          "operationId": "ClassController_deleteTimetable",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete a timetable entry",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/timetable/fetch": {
        "get": {
          "operationId": "ClassController_fetchTimetable",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "teacherId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "periodId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "dayOfWeek",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Fetch timetable for different scenarios",
          "tags": [
            "Class"
          ]
        }
      },
      "/class/subject-dtls/student": {
        "get": {
          "operationId": "ClassController_getSubjectDtlsForStudent",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get subject details for a student",
          "tags": [
            "Class"
          ]
        }
      },
      "/academic/subject-chapter": {
        "post": {
          "operationId": "AcademicController_createChapter",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSubjectChapterDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create subject chapters (bulk)",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_listChapters",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subjectId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List chapters by subject",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/subject-chapter/{id}": {
        "put": {
          "operationId": "AcademicController_updateChapter",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSubjectChapterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update chapter",
          "tags": [
            "Academic"
          ]
        },
        "delete": {
          "operationId": "AcademicController_deleteChapter",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete chapter",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/subject-topic": {
        "post": {
          "operationId": "AcademicController_createTopic",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSubjectTopicDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create subject topics (bulk)",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_listTopics",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subjectId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "chapterId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List topics by chapter",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/subject-topic/{id}": {
        "put": {
          "operationId": "AcademicController_updateTopic",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateSubjectTopicDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update topic",
          "tags": [
            "Academic"
          ]
        },
        "delete": {
          "operationId": "AcademicController_deleteTopic",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete topic",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/teaching-progress": {
        "post": {
          "operationId": "AcademicController_createProgress",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateTeachingProgressDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Save teaching progress",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/teaching-progress/{id}": {
        "put": {
          "operationId": "AcademicController_updateProgress",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeachingProgressDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update teaching progress",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/subject-progress": {
        "get": {
          "operationId": "AcademicController_getSubjectProgress",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "subjectId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get subject-level progress",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/chapter-progress": {
        "get": {
          "operationId": "AcademicController_getChapterProgress",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "chapterId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get chapter-level topic progress",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework": {
        "post": {
          "operationId": "AcademicController_createHomework",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateHomeworkDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create homework",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_listHomeworks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List homeworks",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework/{id}": {
        "put": {
          "operationId": "AcademicController_updateHomework",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateHomeworkDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update homework",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework-attachment": {
        "post": {
          "operationId": "AcademicController_uploadHomeworkAttachment",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UploadHomeworkAttachmentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Upload homework attachment",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_getHomeworkAttachments",
          "parameters": [
            {
              "name": "homeworkId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get homework attachments with signed URLs",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework-attachment/{id}": {
        "delete": {
          "operationId": "AcademicController_deleteHomeworkAttachment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete homework attachment",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework-submission": {
        "post": {
          "operationId": "AcademicController_createSubmission",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateHomeworkSubmissionDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Submit homework",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_getSubmissions",
          "parameters": [
            {
              "name": "homeworkId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List homework submissions",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework-submission/{id}": {
        "put": {
          "operationId": "AcademicController_updateSubmission",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateHomeworkSubmissionDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update homework submission",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/homework-details": {
        "get": {
          "operationId": "AcademicController_getHomeworkDetails",
          "parameters": [
            {
              "name": "homeworkId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List homework details",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/classwork": {
        "post": {
          "operationId": "AcademicController_createClasswork",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateClassworkDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create classwork",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_listClassworks",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List classwork",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/classwork/{id}": {
        "put": {
          "operationId": "AcademicController_updateClasswork",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateClassworkDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update classwork",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/study-material": {
        "post": {
          "operationId": "AcademicController_uploadStudyMaterial",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UploadTeacherStudyMaterialDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Upload study material",
          "tags": [
            "Academic"
          ]
        },
        "get": {
          "operationId": "AcademicController_listStudyMaterials",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List study materials with signed URLs",
          "tags": [
            "Academic"
          ]
        }
      },
      "/academic/study-material/{id}": {
        "put": {
          "operationId": "AcademicController_updateStudyMaterial",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeacherStudyMaterialDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update study material metadata",
          "tags": [
            "Academic"
          ]
        },
        "delete": {
          "operationId": "AcademicController_deleteStudyMaterial",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete study material",
          "tags": [
            "Academic"
          ]
        }
      },
      "/examination/exam": {
        "post": {
          "operationId": "ExamMasterController_createExam",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateExamMasterDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create exam master",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam/{id}": {
        "put": {
          "operationId": "ExamMasterController_updateExam",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateExamMasterDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update exam master",
          "tags": [
            "Examination - Master"
          ]
        },
        "delete": {
          "operationId": "ExamMasterController_deleteExam",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete exam",
          "tags": [
            "Examination - Master"
          ]
        },
        "get": {
          "operationId": "ExamMasterController_getExamById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get exam by ID",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exams": {
        "get": {
          "operationId": "ExamMasterController_listExams",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List exams",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-subject": {
        "post": {
          "operationId": "ExamMasterController_createExamSubjects",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateExamSubjectDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create exam subject configurations (bulk)",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-subject/{id}": {
        "put": {
          "operationId": "ExamMasterController_updateExamSubject",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateExamSubjectItemDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update exam subject config",
          "tags": [
            "Examination - Master"
          ]
        },
        "delete": {
          "operationId": "ExamMasterController_deleteExamSubject",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete exam subject config",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-subjects": {
        "get": {
          "operationId": "ExamMasterController_listExamSubjects",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "examId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List exam subjects",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/grade-config": {
        "post": {
          "operationId": "ExamMasterController_configureGrades",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateGradeMstrDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create or update grade configuration (bulk replace)",
          "tags": [
            "Examination - Master"
          ]
        },
        "get": {
          "operationId": "ExamMasterController_getGrades",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get grade configuration",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/grade-config/{id}": {
        "delete": {
          "operationId": "ExamMasterController_deleteGrade",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete a single grade entry",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-type": {
        "post": {
          "operationId": "ExamMasterController_createExamType",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateExamTypeDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create exam type (admin only)",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-type/{id}": {
        "put": {
          "operationId": "ExamMasterController_updateExamType",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateExamTypeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update exam type (admin only)",
          "tags": [
            "Examination - Master"
          ]
        },
        "get": {
          "operationId": "ExamMasterController_getExamTypeById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get exam type by ID",
          "tags": [
            "Examination - Master"
          ]
        },
        "delete": {
          "operationId": "ExamMasterController_deleteExamType",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete exam type (admin only)",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/exam-types": {
        "get": {
          "operationId": "ExamMasterController_listExamTypes",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List exam types",
          "tags": [
            "Examination - Master"
          ]
        }
      },
      "/examination/schedule": {
        "post": {
          "operationId": "ExamScheduleController_createExamSchedules",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateExamScheduleDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create exam schedules (bulk)",
          "tags": [
            "Examination - Schedule"
          ]
        },
        "get": {
          "operationId": "ExamScheduleController_listExamSchedules",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "default": 20,
                "type": "number"
              }
            },
            {
              "name": "search",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortOrder",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "type": "string",
                "enum": [
                  "asc",
                  "desc"
                ]
              }
            },
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "examId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List exam schedules (filterable, paginated)",
          "tags": [
            "Examination - Schedule"
          ]
        }
      },
      "/examination/schedule/{id}": {
        "put": {
          "operationId": "ExamScheduleController_updateExamSchedule",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateExamScheduleDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update exam schedule",
          "tags": [
            "Examination - Schedule"
          ]
        },
        "delete": {
          "operationId": "ExamScheduleController_deleteExamSchedule",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete exam schedule",
          "tags": [
            "Examination - Schedule"
          ]
        }
      },
      "/examination/schedule/student": {
        "get": {
          "operationId": "ExamScheduleController_getMySchedule",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get exam schedules for the logged in student",
          "tags": [
            "Examination - Schedule"
          ]
        }
      },
      "/examination/marks": {
        "post": {
          "operationId": "MarksEntryController_enterMarks",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateMarksEntryDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Enter marks (bulk - one subject, multiple students)",
          "tags": [
            "Examination - Marks Entry"
          ]
        },
        "get": {
          "operationId": "MarksEntryController_getMarks",
          "parameters": [
            {
              "name": "examId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get marks by exam + class + section + subject",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/{id}": {
        "put": {
          "operationId": "MarksEntryController_updateMark",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateMarksDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update individual student mark",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/bulk/absent": {
        "put": {
          "operationId": "MarksEntryController_markAbsent",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BulkAbsentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Mark students as absent (bulk)",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/lock": {
        "post": {
          "operationId": "MarksEntryController_lockMarks",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LockMarksDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Lock marks for a subject",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/unlock": {
        "post": {
          "operationId": "MarksEntryController_unlockMarks",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LockMarksDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Unlock marks (admin override)",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/completion-status": {
        "get": {
          "operationId": "MarksEntryController_getCompletionStatus",
          "parameters": [
            {
              "name": "examId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Marks entry completion status per exam",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/marks/student/{studentId}": {
        "get": {
          "operationId": "MarksEntryController_getStudentSubjectMarks",
          "parameters": [
            {
              "name": "studentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Subject-wise marks for a student",
          "tags": [
            "Examination - Marks Entry"
          ]
        }
      },
      "/examination/result/generate": {
        "post": {
          "operationId": "ResultController_generateFinalResults",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GenerateResultDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate final results for exam+class+section",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/class": {
        "get": {
          "operationId": "ResultController_getClassResults",
          "parameters": [
            {
              "name": "examId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Class result overview",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/remarks/teacher/{id}": {
        "put": {
          "operationId": "ResultController_updateTeacherRemarks",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRemarksDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add/update teacher remarks",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/remarks/principal/{id}": {
        "put": {
          "operationId": "ResultController_updatePrincipalRemarks",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRemarksDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Add/update principal remarks",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/publish": {
        "post": {
          "operationId": "ResultController_publishResults",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PublishResultDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Publish results",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/unpublish": {
        "post": {
          "operationId": "ResultController_unpublishResults",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PublishResultDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Unpublish results",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/result/report-card/{studentId}": {
        "get": {
          "operationId": "ResultController_getReportCard",
          "parameters": [
            {
              "name": "studentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "examId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Generate report card JSON data",
          "tags": [
            "Examination - Results"
          ]
        }
      },
      "/examination/analytics/student-performance/{studentId}": {
        "get": {
          "operationId": "AnalyticsController_getStudentPerformance",
          "parameters": [
            {
              "name": "studentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "examId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "compareExamIds",
              "required": false,
              "in": "query",
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Student performance across exams (trend)",
          "tags": [
            "Examination - Analytics"
          ]
        }
      },
      "/examination/analytics/class-overview": {
        "get": {
          "operationId": "AnalyticsController_getClassOverview",
          "parameters": [
            {
              "name": "examId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "compareExamIds",
              "required": false,
              "in": "query",
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Class performance summary",
          "tags": [
            "Examination - Analytics"
          ]
        }
      },
      "/examination/analytics/subject-analysis": {
        "get": {
          "operationId": "AnalyticsController_getSubjectAnalysis",
          "parameters": [
            {
              "name": "examId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "compareExamIds",
              "required": false,
              "in": "query",
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Subject-wise performance analysis",
          "tags": [
            "Examination - Analytics"
          ]
        }
      },
      "/examination/analytics/toppers": {
        "get": {
          "operationId": "AnalyticsController_getToppers",
          "parameters": [
            {
              "name": "examId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "classSectionId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "subjectId",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "compareExamIds",
              "required": false,
              "in": "query",
              "schema": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Topper list for exam/class",
          "tags": [
            "Examination - Analytics"
          ]
        }
      },
      "/event": {
        "post": {
          "operationId": "EventController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateEventDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create a school event (admin/teacher only)",
          "tags": [
            "Event"
          ]
        },
        "get": {
          "operationId": "EventController_list",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2025-2026",
                "type": "string"
              }
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "example": "HOLIDAY",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-30",
                "type": "string"
              }
            },
            {
              "name": "isHoliday",
              "required": false,
              "in": "query",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "description": "Month number (1-12)",
              "schema": {
                "example": 6,
                "type": "number"
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "description": "Year",
              "schema": {
                "example": 2026,
                "type": "number"
              }
            },
            {
              "name": "targetAudience",
              "required": false,
              "in": "query",
              "schema": {
                "example": "ALL",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List and filter school events",
          "tags": [
            "Event"
          ]
        }
      },
      "/event/calendar": {
        "get": {
          "operationId": "EventController_calendar",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2025-2026",
                "type": "string"
              }
            },
            {
              "name": "eventType",
              "required": false,
              "in": "query",
              "schema": {
                "example": "HOLIDAY",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-30",
                "type": "string"
              }
            },
            {
              "name": "isHoliday",
              "required": false,
              "in": "query",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "month",
              "required": false,
              "in": "query",
              "description": "Month number (1-12)",
              "schema": {
                "example": 6,
                "type": "number"
              }
            },
            {
              "name": "year",
              "required": false,
              "in": "query",
              "description": "Year",
              "schema": {
                "example": 2026,
                "type": "number"
              }
            },
            {
              "name": "targetAudience",
              "required": false,
              "in": "query",
              "schema": {
                "example": "ALL",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Calendar view for a specific month/year",
          "tags": [
            "Event"
          ]
        }
      },
      "/event/upcoming": {
        "get": {
          "operationId": "EventController_upcoming",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Upcoming events for next 7 days",
          "tags": [
            "Event"
          ]
        }
      },
      "/event/holidays": {
        "get": {
          "operationId": "EventController_holidays",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Holidays list for the session",
          "tags": [
            "Event"
          ]
        }
      },
      "/event/{id}": {
        "get": {
          "operationId": "EventController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get details of a specific event",
          "tags": [
            "Event"
          ]
        },
        "put": {
          "operationId": "EventController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateEventDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update a school event (admin/teacher only)",
          "tags": [
            "Event"
          ]
        },
        "delete": {
          "operationId": "EventController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete a school event (admin/teacher only)",
          "tags": [
            "Event"
          ]
        }
      },
      "/event-type": {
        "post": {
          "operationId": "EventTypeController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateEventTypeDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create an event type (admin only)",
          "tags": [
            "Event Type"
          ]
        },
        "get": {
          "operationId": "EventTypeController_list",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2025-2026",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List active event types",
          "tags": [
            "Event Type"
          ]
        }
      },
      "/event-type/{id}": {
        "get": {
          "operationId": "EventTypeController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get details of an event type",
          "tags": [
            "Event Type"
          ]
        },
        "put": {
          "operationId": "EventTypeController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateEventTypeDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update an event type (admin only)",
          "tags": [
            "Event Type"
          ]
        },
        "delete": {
          "operationId": "EventTypeController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete/deactivate an event type (admin only)",
          "tags": [
            "Event Type"
          ]
        }
      },
      "/announcement": {
        "post": {
          "operationId": "AnnouncementController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAnnouncementDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Create an announcement (admin/teacher only)",
          "tags": [
            "Announcement"
          ]
        },
        "get": {
          "operationId": "AnnouncementController_list",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2025-2026",
                "type": "string"
              }
            },
            {
              "name": "priority",
              "required": false,
              "in": "query",
              "schema": {
                "example": "HIGH",
                "type": "string"
              }
            },
            {
              "name": "targetAudience",
              "required": false,
              "in": "query",
              "schema": {
                "example": "ALL",
                "type": "string"
              }
            },
            {
              "name": "isPublished",
              "required": false,
              "in": "query",
              "schema": {
                "example": true,
                "type": "boolean"
              }
            },
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "example": 1,
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "example": 10,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List announcements",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/announcement/{id}": {
        "get": {
          "operationId": "AnnouncementController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get announcement details and mark as read",
          "tags": [
            "Announcement"
          ]
        },
        "put": {
          "operationId": "AnnouncementController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateAnnouncementDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Update an announcement",
          "tags": [
            "Announcement"
          ]
        },
        "delete": {
          "operationId": "AnnouncementController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete an announcement",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/announcement/attachment/{id}": {
        "post": {
          "operationId": "AnnouncementController_addAttachment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Upload file attachment to an announcement",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/announcement/attachment/{attachmentId}": {
        "delete": {
          "operationId": "AnnouncementController_removeAttachment",
          "parameters": [
            {
              "name": "attachmentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Delete announcement attachment file",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/announcement/{id}/pin": {
        "patch": {
          "operationId": "AnnouncementController_togglePin",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Pin/Unpin an announcement",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/announcement/{id}/read-receipts": {
        "get": {
          "operationId": "AnnouncementController_getReadReceipts",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List readers of this announcement (admin/teacher only)",
          "tags": [
            "Announcement"
          ]
        }
      },
      "/teacher-leave": {
        "post": {
          "operationId": "TeacherLeaveController_applyLeave",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApplyLeaveDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Apply for leave (teacher only)",
          "tags": [
            "Teacher Leave"
          ]
        },
        "get": {
          "operationId": "TeacherLeaveController_listLeaves",
          "parameters": [
            {
              "name": "session",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2025-2026",
                "type": "string"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "example": "PENDING",
                "type": "string",
                "enum": [
                  "PENDING",
                  "APPROVED",
                  "REJECTED",
                  "CANCELLED"
                ]
              }
            },
            {
              "name": "teacherId",
              "required": false,
              "in": "query",
              "schema": {
                "example": "teacher-uuid",
                "type": "string"
              }
            },
            {
              "name": "startDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-01",
                "type": "string"
              }
            },
            {
              "name": "endDate",
              "required": false,
              "in": "query",
              "schema": {
                "example": "2026-06-30",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List leaves (admin lists all, teacher lists own)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/teacher-leave/balance": {
        "get": {
          "operationId": "TeacherLeaveController_getLeaveBalances",
          "parameters": [
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get leave balance (teacher only)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/teacher-leave/balance/initialize": {
        "post": {
          "operationId": "TeacherLeaveController_initializeBalances",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InitializeBalanceDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Initialize/update leave balances for all teachers (admin only)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/teacher-leave/{id}/approve": {
        "put": {
          "operationId": "TeacherLeaveController_approveLeave",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApproveLeaveDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Approve a leave request (admin only)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/teacher-leave/{id}/reject": {
        "put": {
          "operationId": "TeacherLeaveController_rejectLeave",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RejectLeaveDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Reject a leave request (admin only)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/teacher-leave/{id}/cancel": {
        "put": {
          "operationId": "TeacherLeaveController_cancelLeave",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Cancel own pending leave request (teacher only)",
          "tags": [
            "Teacher Leave"
          ]
        }
      },
      "/substitute-period": {
        "get": {
          "operationId": "SubstitutePeriodController_list",
          "parameters": [
            {
              "name": "date",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "List substitute periods for a date",
          "tags": [
            "Substitute Period"
          ]
        }
      },
      "/substitute-period/available-teachers": {
        "get": {
          "operationId": "SubstitutePeriodController_findAvailableTeachers",
          "parameters": [
            {
              "name": "date",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "periodId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "session",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get list of available/free teachers for a period slot (admin only)",
          "tags": [
            "Substitute Period"
          ]
        }
      },
      "/substitute-period/{id}/assign": {
        "put": {
          "operationId": "SubstitutePeriodController_assignSubstitute",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AssignSubstituteDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Assign a substitute teacher (admin only)",
          "tags": [
            "Substitute Period"
          ]
        }
      },
      "/teacher-attendance/mark": {
        "post": {
          "operationId": "TeacherAttendanceController_markAttendance",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MarkTeacherAttendanceDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Mark teacher attendance (admin only)",
          "tags": [
            "Teacher Attendance"
          ]
        }
      },
      "/teacher-attendance": {
        "get": {
          "operationId": "TeacherAttendanceController_getAttendance",
          "parameters": [
            {
              "name": "teacherId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "year",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "month",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "Get teacher attendance records for a month (teacher gets own, admin can filter)",
          "tags": [
            "Teacher Attendance"
          ]
        }
      }
    },
    "info": {
      "title": "SkoolConnect API",
      "description": "The SkoolConnect API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "RegisterSuperAdminDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "example": "superadmin",
              "description": "The username of the super admin"
            },
            "password": {
              "type": "string",
              "example": "password123",
              "description": "The password of the super admin"
            }
          },
          "required": [
            "username",
            "password"
          ]
        },
        "LoginSuperAdminDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "example": "superadmin",
              "description": "The username of the super admin"
            },
            "password": {
              "type": "string",
              "example": "password123",
              "description": "The password of the super admin"
            }
          },
          "required": [
            "username",
            "password"
          ]
        },
        "SchoolContactDto": {
          "type": "object",
          "properties": {
            "phone": {
              "type": "string"
            },
            "alternatePhone": {
              "type": "string"
            },
            "fax": {
              "type": "string"
            },
            "email": {
              "type": "string"
            }
          },
          "required": [
            "phone",
            "email"
          ]
        },
        "SchoolOwnerDto": {
          "type": "object",
          "properties": {
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          },
          "required": [
            "firstName",
            "lastName",
            "address",
            "phone"
          ]
        },
        "CreateSchoolDto": {
          "type": "object",
          "properties": {
            "schoolCode": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "pincode": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "schoolAffiliation": {
              "type": "string"
            },
            "schoolBoard": {
              "type": "string"
            },
            "contactDetails": {
              "$ref": "#/components/schemas/SchoolContactDto"
            },
            "ownerDetails": {
              "$ref": "#/components/schemas/SchoolOwnerDto"
            }
          },
          "required": [
            "schoolCode",
            "name",
            "address",
            "city",
            "state",
            "pincode",
            "country",
            "schoolAffiliation",
            "schoolBoard",
            "contactDetails",
            "ownerDetails"
          ]
        },
        "UpdateSchoolDto": {
          "type": "object",
          "properties": {
            "schoolCode": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "pincode": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "schoolAffiliation": {
              "type": "string"
            },
            "schoolBoard": {
              "type": "string"
            },
            "contactDetails": {
              "$ref": "#/components/schemas/SchoolContactDto"
            },
            "ownerDetails": {
              "$ref": "#/components/schemas/SchoolOwnerDto"
            }
          }
        },
        "ClassItemDto": {
          "type": "object",
          "properties": {
            "className": {
              "type": "string",
              "description": "Name of the class (e.g. Class 1)"
            }
          },
          "required": [
            "className"
          ]
        },
        "CreateClassesDto": {
          "type": "object",
          "properties": {
            "classes": {
              "description": "Array of classes to create",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ClassItemDto"
              }
            }
          },
          "required": [
            "classes"
          ]
        },
        "UpdateClassDto": {
          "type": "object",
          "properties": {
            "className": {
              "type": "string",
              "description": "Updated class name"
            }
          }
        },
        "SectionItemDto": {
          "type": "object",
          "properties": {
            "classId": {
              "type": "number",
              "description": "Class ID to associate this section with"
            },
            "sectionName": {
              "type": "string",
              "description": "Name of the section (e.g. A, B, C)"
            }
          },
          "required": [
            "classId",
            "sectionName"
          ]
        },
        "CreateSectionsDto": {
          "type": "object",
          "properties": {
            "sections": {
              "description": "Array of sections to create",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/SectionItemDto"
              }
            }
          },
          "required": [
            "sections"
          ]
        },
        "UpdateSectionDto": {
          "type": "object",
          "properties": {
            "sectionName": {
              "type": "string",
              "description": "Updated section name"
            }
          }
        },
        "CreateAdministratorDto": {
          "type": "object",
          "properties": {
            "schoolId": {
              "type": "string",
              "description": "School ID"
            },
            "employeeId": {
              "type": "string",
              "description": "Employee ID"
            },
            "firstName": {
              "type": "string",
              "description": "First name"
            },
            "lastName": {
              "type": "string",
              "description": "Last name"
            },
            "address": {
              "type": "string",
              "description": "Address"
            },
            "email": {
              "type": "string",
              "description": "Email address"
            },
            "phone": {
              "type": "string",
              "description": "Phone number"
            },
            "username": {
              "type": "string",
              "description": "Username for login"
            },
            "password": {
              "type": "string",
              "description": "Password for login"
            }
          },
          "required": [
            "schoolId",
            "employeeId",
            "firstName",
            "lastName",
            "phone",
            "username",
            "password"
          ]
        },
        "UpdateAdministratorDto": {
          "type": "object",
          "properties": {
            "employeeId": {
              "type": "string",
              "description": "Employee ID"
            },
            "firstName": {
              "type": "string",
              "description": "First name"
            },
            "lastName": {
              "type": "string",
              "description": "Last name"
            },
            "address": {
              "type": "string",
              "description": "Address"
            },
            "email": {
              "type": "string",
              "description": "Email address"
            },
            "phone": {
              "type": "string",
              "description": "Phone number"
            }
          }
        },
        "CreateTeacherDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "description": "Username for login"
            },
            "password": {
              "type": "string",
              "description": "Password for login"
            },
            "schoolId": {
              "type": "string",
              "description": "School ID"
            },
            "employeeId": {
              "type": "string",
              "description": "Employee ID"
            },
            "isPrincipal": {
              "type": "boolean",
              "description": "Is Principal",
              "default": false
            },
            "isCoordinator": {
              "type": "boolean",
              "description": "Is Coordinator",
              "default": false
            },
            "isClassTeacher": {
              "type": "boolean",
              "description": "Is Class Teacher",
              "default": false
            },
            "isSubjectTeacher": {
              "type": "boolean",
              "description": "Is Subject Teacher",
              "default": false
            },
            "firstName": {
              "type": "string",
              "description": "First name"
            },
            "lastName": {
              "type": "string",
              "description": "Last name"
            },
            "dateOfBirth": {
              "type": "string",
              "description": "Date of Birth (YYYY-MM-DD)"
            },
            "gender": {
              "type": "string",
              "description": "Gender"
            },
            "mobileNumber": {
              "type": "string",
              "description": "Mobile number"
            },
            "alternateMobileNumber": {
              "type": "string",
              "description": "Alternate mobile number"
            },
            "emailId": {
              "type": "string",
              "description": "Email address"
            },
            "joiningDate": {
              "type": "string",
              "description": "Joining Date (YYYY-MM-DD)"
            },
            "employeeEmail": {
              "type": "string",
              "description": "Employee Email"
            },
            "coordinatorClasses": {
              "description": "Classes assigned as coordinator",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "classTeacherClass": {
              "type": "object",
              "description": "Class assigned as class teacher"
            }
          },
          "required": [
            "username",
            "password",
            "employeeId",
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
            "mobileNumber",
            "emailId",
            "joiningDate",
            "employeeEmail"
          ]
        },
        "UpdateTeacherDtlsDto": {
          "type": "object",
          "properties": {
            "isPrincipal": {
              "type": "boolean",
              "description": "Is Principal"
            },
            "isCoordinator": {
              "type": "boolean",
              "description": "Is Coordinator"
            },
            "isClassTeacher": {
              "type": "boolean",
              "description": "Is Class Teacher"
            },
            "isSubjectTeacher": {
              "type": "boolean",
              "description": "Is Subject Teacher"
            },
            "firstName": {
              "type": "string",
              "description": "First name"
            },
            "lastName": {
              "type": "string",
              "description": "Last name"
            },
            "dateOfBirth": {
              "type": "string",
              "description": "Date of Birth (YYYY-MM-DD)"
            },
            "gender": {
              "type": "string",
              "description": "Gender"
            },
            "mobileNumber": {
              "type": "string",
              "description": "Mobile number"
            },
            "alternateMobileNumber": {
              "type": "string",
              "description": "Alternate mobile number"
            },
            "emailId": {
              "type": "string",
              "description": "Email address"
            },
            "teacherPersonalData": {
              "type": "object",
              "description": "Teacher Personal Data JSON"
            },
            "teacherAcademicData": {
              "type": "object",
              "description": "Teacher Academic Data JSON"
            },
            "teacherProfessionalData": {
              "type": "object",
              "description": "Teacher Professional Data JSON"
            },
            "teacherFamilyDetails": {
              "type": "object",
              "description": "Teacher Family Details JSON"
            }
          }
        },
        "CreateTeacherAddressDto": {
          "type": "object",
          "properties": {
            "isPermanent": {
              "type": "boolean",
              "description": "Is permanent address",
              "default": false
            },
            "address": {
              "type": "string",
              "description": "Full address block"
            },
            "state": {
              "type": "string",
              "description": "State"
            },
            "city": {
              "type": "string",
              "description": "City"
            },
            "country": {
              "type": "string",
              "description": "Country"
            },
            "pincode": {
              "type": "string",
              "description": "Pincode/Zipcode"
            },
            "googleAddressUrl": {
              "type": "string",
              "description": "Google maps URL"
            },
            "latitude": {
              "type": "string",
              "description": "Latitude"
            },
            "longitude": {
              "type": "string",
              "description": "Longitude"
            }
          },
          "required": [
            "address",
            "state",
            "city",
            "country",
            "pincode"
          ]
        },
        "UpdateTeacherAddressDto": {
          "type": "object",
          "properties": {
            "isPermanent": {
              "type": "boolean",
              "description": "Is permanent address",
              "default": false
            },
            "address": {
              "type": "string",
              "description": "Full address block"
            },
            "state": {
              "type": "string",
              "description": "State"
            },
            "city": {
              "type": "string",
              "description": "City"
            },
            "country": {
              "type": "string",
              "description": "Country"
            },
            "pincode": {
              "type": "string",
              "description": "Pincode/Zipcode"
            },
            "googleAddressUrl": {
              "type": "string",
              "description": "Google maps URL"
            },
            "latitude": {
              "type": "string",
              "description": "Latitude"
            },
            "longitude": {
              "type": "string",
              "description": "Longitude"
            }
          }
        },
        "UpdateTeacherSchoolRecordDto": {
          "type": "object",
          "properties": {
            "employeeId": {
              "type": "string",
              "description": "Employee ID"
            },
            "joiningDate": {
              "type": "string",
              "description": "Joining Date (YYYY-MM-DD)"
            },
            "employeeEmail": {
              "type": "string",
              "description": "Employee Email"
            }
          }
        },
        "AddClassTeacherDto": {
          "type": "object",
          "properties": {
            "classTeacherId": {
              "type": "string",
              "description": "Teacher ID"
            },
            "className": {
              "type": "string",
              "description": "Class Name"
            },
            "sectionName": {
              "type": "string",
              "description": "Section Name"
            },
            "schoolId": {
              "type": "string",
              "description": "School ID"
            }
          },
          "required": [
            "classTeacherId",
            "className",
            "sectionName"
          ]
        },
        "CreateStudentDto": {
          "type": "object",
          "properties": {
            "username": {
              "type": "string",
              "description": "Username for the user table"
            },
            "password": {
              "type": "string",
              "description": "Password for the user table"
            },
            "schoolId": {
              "type": "string",
              "description": "School UUID"
            },
            "firstName": {
              "type": "string",
              "description": "First name of the student"
            },
            "lastName": {
              "type": "string",
              "description": "Last name of the student"
            },
            "dateOfBirth": {
              "type": "object",
              "description": "Date of birth of the student",
              "example": "2010-05-15T00:00:00Z"
            },
            "gender": {
              "type": "string",
              "description": "Gender of the student"
            },
            "bloodGroup": {
              "type": "string",
              "description": "Blood group of the student"
            },
            "mobileNumber": {
              "type": "string",
              "description": "Mobile number of the student"
            },
            "alternateMobileNumber": {
              "type": "string",
              "description": "Alternate mobile number"
            },
            "emailId": {
              "type": "string",
              "description": "Email ID of the student"
            },
            "caste": {
              "type": "string",
              "description": "Caste of the student"
            },
            "religion": {
              "type": "string",
              "description": "Religion of the student"
            },
            "nationality": {
              "type": "string",
              "description": "Nationality of the student"
            }
          },
          "required": [
            "username",
            "password",
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
            "mobileNumber",
            "emailId"
          ]
        },
        "UpdateStudentDtlsDto": {
          "type": "object",
          "properties": {
            "firstName": {
              "type": "string",
              "description": "First name of the student"
            },
            "lastName": {
              "type": "string",
              "description": "Last name of the student"
            },
            "dateOfBirth": {
              "type": "object",
              "description": "Date of birth of the student",
              "example": "2010-05-15T00:00:00Z"
            },
            "gender": {
              "type": "string",
              "description": "Gender of the student"
            },
            "bloodGroup": {
              "type": "string",
              "description": "Blood group of the student"
            },
            "mobileNumber": {
              "type": "string",
              "description": "Mobile number of the student"
            },
            "alternateMobileNumber": {
              "type": "string",
              "description": "Alternate mobile number"
            },
            "emailId": {
              "type": "string",
              "description": "Email ID of the student"
            },
            "caste": {
              "type": "string",
              "description": "Caste of the student"
            },
            "religion": {
              "type": "string",
              "description": "Religion of the student"
            },
            "nationality": {
              "type": "string",
              "description": "Nationality of the student"
            }
          }
        },
        "UpdateStudentStatusDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "description": "Status of the student",
              "example": "Inactive"
            }
          },
          "required": [
            "status"
          ]
        },
        "CreateStudentAcademicDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "description": "Academic session (e.g., 2024-2025)"
            },
            "classSectionId": {
              "type": "number",
              "description": "Class Section ID from class_sections table"
            },
            "rollNumber": {
              "type": "string"
            },
            "admissionNumber": {
              "type": "string"
            },
            "admissionDate": {
              "type": "object"
            },
            "convenceMode": {
              "type": "string"
            },
            "convenceModeNumber": {
              "type": "string"
            }
          },
          "required": [
            "classSectionId",
            "rollNumber",
            "admissionNumber",
            "admissionDate",
            "convenceMode"
          ]
        },
        "UpdateStudentAcademicDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "description": "Academic session (e.g., 2024-2025)"
            },
            "classSectionId": {
              "type": "number",
              "description": "Class Section ID from class_sections table"
            },
            "rollNumber": {
              "type": "string"
            },
            "admissionNumber": {
              "type": "string"
            },
            "admissionDate": {
              "type": "object"
            },
            "convenceMode": {
              "type": "string"
            },
            "convenceModeNumber": {
              "type": "string"
            }
          }
        },
        "CreateStudentParentDto": {
          "type": "object",
          "properties": {
            "relation": {
              "type": "string"
            },
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "mobileNumber": {
              "type": "string"
            },
            "emailId": {
              "type": "string"
            },
            "address": {
              "type": "string"
            }
          },
          "required": [
            "relation",
            "firstName",
            "lastName",
            "mobileNumber"
          ]
        },
        "UpdateStudentParentDto": {
          "type": "object",
          "properties": {
            "relation": {
              "type": "string"
            },
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "mobileNumber": {
              "type": "string"
            },
            "emailId": {
              "type": "string"
            },
            "address": {
              "type": "string"
            }
          }
        },
        "CreateMedicalHistoryDto": {
          "type": "object",
          "properties": {
            "medicalHistory": {
              "type": "string"
            }
          },
          "required": [
            "medicalHistory"
          ]
        },
        "UpdateMedicalHistoryDto": {
          "type": "object",
          "properties": {
            "medicalHistory": {
              "type": "string"
            }
          }
        },
        "CreateStudentAddressDto": {
          "type": "object",
          "properties": {
            "isPermanent": {
              "type": "boolean"
            },
            "address": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "pincode": {
              "type": "string"
            },
            "googleAddressUrl": {
              "type": "string"
            },
            "latitude": {
              "type": "string"
            },
            "longitude": {
              "type": "string"
            }
          },
          "required": [
            "address",
            "state",
            "city",
            "country",
            "pincode"
          ]
        },
        "UpdateStudentAddressDto": {
          "type": "object",
          "properties": {
            "isPermanent": {
              "type": "boolean"
            },
            "address": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "pincode": {
              "type": "string"
            },
            "googleAddressUrl": {
              "type": "string"
            },
            "latitude": {
              "type": "string"
            },
            "longitude": {
              "type": "string"
            }
          }
        },
        "StudentAttendanceItemDto": {
          "type": "object",
          "properties": {
            "studentId": {
              "type": "string",
              "description": "ID of the student"
            },
            "attendanceStatus": {
              "type": "string",
              "description": "Attendance status (e.g., present, absent, late)"
            }
          },
          "required": [
            "studentId",
            "attendanceStatus"
          ]
        },
        "BulkAddAttendanceDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "description": "Academic session (e.g., 2024-2025)"
            },
            "date": {
              "type": "string",
              "description": "Date of attendance",
              "example": "2023-10-25"
            },
            "attendance": {
              "description": "Array of student attendance records",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/StudentAttendanceItemDto"
              }
            }
          },
          "required": [
            "date",
            "attendance"
          ]
        },
        "UpdateAttendanceDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "description": "Attendance status (e.g., present, absent, late)"
            }
          },
          "required": [
            "status"
          ]
        },
        "CreateClassDtlsDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "description": "Academic session (e.g. 2025-2026)"
            },
            "classSectionsId": {
              "type": "number",
              "description": "Class Section ID"
            },
            "classTeacherId": {
              "type": "string",
              "description": "UUID of the class teacher"
            },
            "maxLimit": {
              "type": "number",
              "description": "Maximum student limit"
            }
          },
          "required": [
            "session",
            "classSectionsId"
          ]
        },
        "UpdateClassDtlsDto": {
          "type": "object",
          "properties": {
            "classTeacherId": {
              "type": "string",
              "description": "UUID of the class teacher"
            },
            "maxLimit": {
              "type": "number",
              "description": "Maximum student limit"
            }
          }
        },
        "SubjectItemDto": {
          "type": "object",
          "properties": {
            "subjectName": {
              "type": "string"
            },
            "subjectCode": {
              "type": "string"
            }
          },
          "required": [
            "subjectName",
            "subjectCode"
          ]
        },
        "CreateSubjectDtlsDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "subjects": {
              "description": "Array of subjects to create",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/SubjectItemDto"
              }
            }
          },
          "required": [
            "session",
            "subjects"
          ]
        },
        "UpdateSubjectDtlsDto": {
          "type": "object",
          "properties": {
            "subjectName": {
              "type": "string"
            },
            "subjectCode": {
              "type": "string"
            }
          }
        },
        "ClassSubjectDtlsItemDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "teacherId": {
              "type": "string"
            },
            "classId": {
              "type": "number"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            }
          },
          "required": [
            "session",
            "teacherId",
            "classId",
            "classSectionId",
            "subjectId"
          ]
        },
        "CreateClassSubjectDtlsDto": {
          "type": "object",
          "properties": {
            "entries": {
              "description": "Single or bulk class-subject-teacher mappings",
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ClassSubjectDtlsItemDto"
              }
            }
          },
          "required": [
            "entries"
          ]
        },
        "UpdateClassSubjectDtlsDto": {
          "type": "object",
          "properties": {
            "teacherId": {
              "type": "string"
            },
            "classId": {
              "type": "number"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            }
          }
        },
        "UpdatePeriodSlotDto": {
          "type": "object",
          "properties": {
            "periodNumber": {
              "type": "number"
            },
            "startTime": {
              "type": "string"
            },
            "endTime": {
              "type": "string"
            }
          }
        },
        "UpdateTimetableDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "classSubjectId": {
              "type": "string",
              "description": "ClassSubjectDtls UUID"
            },
            "periodId": {
              "type": "number"
            },
            "dayOfWeek": {
              "type": "string"
            }
          }
        },
        "ChapterItemDto": {
          "type": "object",
          "properties": {
            "chapterName": {
              "type": "string"
            },
            "sequenceNo": {
              "type": "number"
            }
          },
          "required": [
            "chapterName",
            "sequenceNo"
          ]
        },
        "CreateSubjectChapterDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "subjectId": {
              "type": "number"
            },
            "chapters": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ChapterItemDto"
              }
            }
          },
          "required": [
            "session",
            "subjectId",
            "chapters"
          ]
        },
        "UpdateSubjectChapterDto": {
          "type": "object",
          "properties": {
            "chapterName": {
              "type": "string"
            },
            "sequenceNo": {
              "type": "number"
            }
          }
        },
        "TopicItemDto": {
          "type": "object",
          "properties": {
            "topicName": {
              "type": "string"
            },
            "sequenceNo": {
              "type": "number"
            }
          },
          "required": [
            "topicName",
            "sequenceNo"
          ]
        },
        "CreateSubjectTopicDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "subjectId": {
              "type": "number"
            },
            "chapterId": {
              "type": "number"
            },
            "topics": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/TopicItemDto"
              }
            }
          },
          "required": [
            "session",
            "subjectId",
            "chapterId",
            "topics"
          ]
        },
        "UpdateSubjectTopicDto": {
          "type": "object",
          "properties": {
            "topicName": {
              "type": "string"
            },
            "sequenceNo": {
              "type": "number"
            }
          }
        },
        "CreateTeachingProgressDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            },
            "chapterId": {
              "type": "number"
            },
            "topicId": {
              "type": "number"
            },
            "status": {
              "type": "string"
            },
            "completionPercentage": {
              "type": "number"
            }
          },
          "required": [
            "session",
            "classSectionId",
            "subjectId",
            "chapterId",
            "topicId",
            "status"
          ]
        },
        "UpdateTeachingProgressDto": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "completionPercentage": {
              "type": "number"
            },
            "completedOn": {
              "format": "date-time",
              "type": "string"
            }
          }
        },
        "CreateHomeworkDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            },
            "chapterId": {
              "type": "number"
            },
            "topicId": {
              "type": "number"
            },
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "dueDate": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "session",
            "classSectionId",
            "subjectId",
            "title",
            "description",
            "dueDate"
          ]
        },
        "UpdateHomeworkDto": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "dueDate": {
              "format": "date-time",
              "type": "string"
            }
          }
        },
        "UploadHomeworkAttachmentDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "homeworkId": {
              "type": "string"
            }
          },
          "required": [
            "session",
            "homeworkId"
          ]
        },
        "CreateHomeworkSubmissionDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "homeworkId": {
              "type": "number"
            },
            "remarks": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "submittedAt": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "session",
            "homeworkId",
            "status"
          ]
        },
        "UpdateHomeworkSubmissionDto": {
          "type": "object",
          "properties": {
            "remarks": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "submittedAt": {
              "format": "date-time",
              "type": "string"
            }
          }
        },
        "CreateClassworkDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            },
            "chapterId": {
              "type": "number"
            },
            "topicId": {
              "type": "number"
            },
            "description": {
              "type": "string"
            }
          },
          "required": [
            "session",
            "classSectionId",
            "subjectId",
            "description"
          ]
        },
        "UpdateClassworkDto": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string"
            }
          }
        },
        "UploadTeacherStudyMaterialDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string"
            },
            "classId": {
              "type": "number"
            },
            "classSectionId": {
              "type": "number"
            },
            "subjectId": {
              "type": "number"
            },
            "chapterId": {
              "type": "number"
            },
            "topicId": {
              "type": "number"
            },
            "description": {
              "type": "string"
            }
          },
          "required": [
            "session",
            "classId",
            "classSectionId",
            "subjectId",
            "description"
          ]
        },
        "UpdateTeacherStudyMaterialDto": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string"
            }
          }
        },
        "CreateExamMasterDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateExamMasterDto": {
          "type": "object",
          "properties": {}
        },
        "CreateExamSubjectDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateExamSubjectItemDto": {
          "type": "object",
          "properties": {}
        },
        "CreateGradeMstrDto": {
          "type": "object",
          "properties": {}
        },
        "CreateExamTypeDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateExamTypeDto": {
          "type": "object",
          "properties": {}
        },
        "CreateExamScheduleDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateExamScheduleDto": {
          "type": "object",
          "properties": {}
        },
        "CreateMarksEntryDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateMarksDto": {
          "type": "object",
          "properties": {}
        },
        "BulkAbsentDto": {
          "type": "object",
          "properties": {}
        },
        "LockMarksDto": {
          "type": "object",
          "properties": {}
        },
        "GenerateResultDto": {
          "type": "object",
          "properties": {}
        },
        "UpdateRemarksDto": {
          "type": "object",
          "properties": {}
        },
        "PublishResultDto": {
          "type": "object",
          "properties": {}
        },
        "EventTargetClassDto": {
          "type": "object",
          "properties": {
            "classId": {
              "type": "number",
              "example": 1
            },
            "sectionId": {
              "type": "number",
              "example": 1
            }
          },
          "required": [
            "classId"
          ]
        },
        "CreateEventDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "title": {
              "type": "string",
              "example": "Annual Sports Day"
            },
            "description": {
              "type": "string",
              "example": "Annual sports events for classes 1 to 10"
            },
            "eventType": {
              "type": "string",
              "example": "SPORTS",
              "description": "HOLIDAY | EXAM | MEETING | CULTURAL | SPORTS | PTM | OTHER"
            },
            "startDate": {
              "type": "string",
              "example": "2026-06-15"
            },
            "endDate": {
              "type": "string",
              "example": "2026-06-16"
            },
            "startTime": {
              "type": "string",
              "example": "09:00 AM"
            },
            "endTime": {
              "type": "string",
              "example": "04:00 PM"
            },
            "isFullDay": {
              "type": "boolean",
              "example": true
            },
            "isHoliday": {
              "type": "boolean",
              "example": false
            },
            "targetAudience": {
              "type": "string",
              "example": "ALL",
              "description": "ALL | TEACHERS | STUDENTS | PARENTS | SPECIFIC_CLASS"
            },
            "targetClasses": {
              "example": [
                {
                  "classId": 1
                },
                {
                  "classId": 2
                }
              ],
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/EventTargetClassDto"
              }
            },
            "location": {
              "type": "string",
              "example": "School playground"
            }
          },
          "required": [
            "session",
            "title",
            "eventType",
            "startDate",
            "endDate",
            "targetAudience"
          ]
        },
        "UpdateEventDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "title": {
              "type": "string",
              "example": "Annual Sports Day"
            },
            "description": {
              "type": "string",
              "example": "Annual sports events for classes 1 to 10"
            },
            "eventType": {
              "type": "string",
              "example": "SPORTS",
              "description": "HOLIDAY | EXAM | MEETING | CULTURAL | SPORTS | PTM | OTHER"
            },
            "startDate": {
              "type": "string",
              "example": "2026-06-15"
            },
            "endDate": {
              "type": "string",
              "example": "2026-06-16"
            },
            "startTime": {
              "type": "string",
              "example": "09:00 AM"
            },
            "endTime": {
              "type": "string",
              "example": "04:00 PM"
            },
            "isFullDay": {
              "type": "boolean",
              "example": true
            },
            "isHoliday": {
              "type": "boolean",
              "example": false
            },
            "targetAudience": {
              "type": "string",
              "example": "ALL",
              "description": "ALL | TEACHERS | STUDENTS | PARENTS | SPECIFIC_CLASS"
            },
            "targetClasses": {
              "example": [
                {
                  "classId": 1
                },
                {
                  "classId": 2
                }
              ],
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/EventTargetClassDto"
              }
            },
            "location": {
              "type": "string",
              "example": "School playground"
            }
          }
        },
        "CreateEventTypeDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "name": {
              "type": "string",
              "example": "HOLIDAY"
            }
          },
          "required": [
            "session",
            "name"
          ]
        },
        "UpdateEventTypeDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "HOLIDAY"
            },
            "isActive": {
              "type": "boolean",
              "example": true
            }
          }
        },
        "AnnouncementTargetClassDto": {
          "type": "object",
          "properties": {
            "classId": {
              "type": "number",
              "example": 1
            },
            "sectionId": {
              "type": "number",
              "example": 1
            }
          },
          "required": [
            "classId"
          ]
        },
        "CreateAnnouncementDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "title": {
              "type": "string",
              "example": "School Reopening Schedule"
            },
            "content": {
              "type": "string",
              "example": "Please note the school will reopen on 15th June 2026."
            },
            "priority": {
              "type": "string",
              "example": "NORMAL",
              "description": "LOW | NORMAL | HIGH | URGENT"
            },
            "targetAudience": {
              "type": "string",
              "example": "ALL",
              "description": "ALL | TEACHERS | STUDENTS | PARENTS | SPECIFIC_CLASS"
            },
            "targetClasses": {
              "example": [
                {
                  "classId": 1
                },
                {
                  "classId": 2
                }
              ],
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/AnnouncementTargetClassDto"
              }
            },
            "publishAt": {
              "type": "string",
              "example": "2026-06-07T12:00:00Z"
            },
            "expiresAt": {
              "type": "string",
              "example": "2026-06-30T12:00:00Z"
            },
            "isPinned": {
              "type": "boolean",
              "example": false
            },
            "isPublished": {
              "type": "boolean",
              "example": true
            }
          },
          "required": [
            "session",
            "title",
            "content"
          ]
        },
        "UpdateAnnouncementDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "title": {
              "type": "string",
              "example": "School Reopening Schedule"
            },
            "content": {
              "type": "string",
              "example": "Please note the school will reopen on 15th June 2026."
            },
            "priority": {
              "type": "string",
              "example": "NORMAL",
              "description": "LOW | NORMAL | HIGH | URGENT"
            },
            "targetAudience": {
              "type": "string",
              "example": "ALL",
              "description": "ALL | TEACHERS | STUDENTS | PARENTS | SPECIFIC_CLASS"
            },
            "targetClasses": {
              "example": [
                {
                  "classId": 1
                },
                {
                  "classId": 2
                }
              ],
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/AnnouncementTargetClassDto"
              }
            },
            "publishAt": {
              "type": "string",
              "example": "2026-06-07T12:00:00Z"
            },
            "expiresAt": {
              "type": "string",
              "example": "2026-06-30T12:00:00Z"
            },
            "isPinned": {
              "type": "boolean",
              "example": false
            },
            "isPublished": {
              "type": "boolean",
              "example": true
            }
          }
        },
        "ApplyLeaveDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "leaveType": {
              "type": "string",
              "example": "CASUAL",
              "enum": [
                "CASUAL",
                "SICK",
                "EARNED",
                "HALF_DAY",
                "EMERGENCY"
              ]
            },
            "startDate": {
              "type": "string",
              "example": "2026-06-10"
            },
            "endDate": {
              "type": "string",
              "example": "2026-06-12"
            },
            "reason": {
              "type": "string",
              "example": "Family function"
            }
          },
          "required": [
            "session",
            "leaveType",
            "startDate",
            "endDate",
            "reason"
          ]
        },
        "InitializeBalanceDto": {
          "type": "object",
          "properties": {
            "session": {
              "type": "string",
              "example": "2025-2026"
            },
            "casualLeaves": {
              "type": "number",
              "example": 12
            },
            "sickLeaves": {
              "type": "number",
              "example": 10
            },
            "earnedLeaves": {
              "type": "number",
              "example": 15
            }
          },
          "required": [
            "session",
            "casualLeaves",
            "sickLeaves",
            "earnedLeaves"
          ]
        },
        "ApproveLeaveDto": {
          "type": "object",
          "properties": {
            "notes": {
              "type": "string",
              "example": "Approved, cover classes scheduled"
            }
          }
        },
        "RejectLeaveDto": {
          "type": "object",
          "properties": {
            "rejectionReason": {
              "type": "string",
              "example": "Reopening week, leaves not allowed"
            }
          },
          "required": [
            "rejectionReason"
          ]
        },
        "AssignSubstituteDto": {
          "type": "object",
          "properties": {
            "substituteTeacherId": {
              "type": "string",
              "example": "substitute-teacher-uuid"
            },
            "notes": {
              "type": "string",
              "example": "Covering period for Science class"
            }
          },
          "required": [
            "substituteTeacherId"
          ]
        },
        "MarkTeacherAttendanceDto": {
          "type": "object",
          "properties": {
            "teacherId": {
              "type": "string",
              "example": "teacher-uuid"
            },
            "date": {
              "type": "string",
              "example": "2026-06-10"
            },
            "status": {
              "type": "string",
              "example": "PRESENT",
              "enum": [
                "PRESENT",
                "ABSENT",
                "HALF_DAY",
                "ON_LEAVE"
              ]
            }
          },
          "required": [
            "teacherId",
            "date",
            "status"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
