import fs from 'fs';

// Helper function
export const base64_encode_image = (file: string): string => {
    // return "data:image/gif;base64," + fs.readFileSync(file, 'base64');
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}
