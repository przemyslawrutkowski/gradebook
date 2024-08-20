interface SuccessResponse<T> {
    data: T;
    message: string;
}

interface ErrorResponse {
    message: string;
}

export const createSuccessResponse = <T>(data: T, message: string): SuccessResponse<T> => ({
    data,
    message
});

export const createErrorResponse = (message: string): ErrorResponse => ({
    message
});