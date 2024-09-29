import http from 'node:http';
import { PORT, BEARER_TOKEN } from '../../src/modules/validateEnv';

export const sendPostRequest = async (path: string, postData: object, bearerToken?: string) => {
    const dataString = JSON.stringify(postData);

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
            'Authorization': bearerToken ? `Bearer ${bearerToken}` : `Bearer ${BEARER_TOKEN}`
        },
    };

    return new Promise<{ statusCode?: number, body: any }>((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(dataString);
        req.end();
    });
};

export const sendGetRequest = async (path: string) => {
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    return new Promise<{ statusCode?: number, body: any }>((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
};

export const sendPatchRequest = async (path: string, patchData: object) => {
    const dataString = JSON.stringify(patchData);

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    return new Promise<{ statusCode?: number, body: any }>((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(dataString);
        req.end();
    });
};

export const sendDeleteRequest = async (path: string) => {
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    return new Promise<{ statusCode?: number, body: any }>((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
};