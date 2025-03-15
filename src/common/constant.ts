export const STARTDATE = '2005-01-03';

export const KAKAO_API_KEY = process.env.KAKAO_API_KEY as string;

export const MY_HOST = process.env.MY_HOST as string;

export const KAKAO_REDIRECT_URI = `http://${process.env.MY_HOST}/auth/kakao/callback`;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const BEARER_TOKEN_SECRET = process.env.BEARER_TOKEN_SECRET as string;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const MAX_USER_COUNT = 100;
