const swaggerJSDoc = require('swagger-jsdoc');
// const routes = require('routes');

const swaggerDefinition = {
    openapi:'3.0.0',
    info: {
        title: 'Social Auth API',
        version: '1.0.0',
        description: 'API documentation for the Social Auth API. [Live Frontend for this Application](https://client-social-auth-role-based.vercel.app/)',

    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{
        bearerAuth: []
    }],
};

const options = {
    swaggerDefinition,
    apis: ['routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

