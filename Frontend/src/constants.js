export const API_BASE_PATH = () => {
    console.log(process.env);
    return process.env.NODE_ENV === 'productionn' ? 'http://api:5000' : 'http://localhost:5000';
}