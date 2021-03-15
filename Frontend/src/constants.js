export const API_BASE_PATH = () => {
    return process.env.REACT_APP_ENV === 'production' ? 'http://161.35.214.217:5000' : 'http://localhost:5000';
}
