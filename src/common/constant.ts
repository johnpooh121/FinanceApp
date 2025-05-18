export const STARTDATE = '2005-01-03';

export const KAKAO_API_KEY = process.env.KAKAO_API_KEY as string;

export const ROOT_DOMAIN = process.env.ROOT_DOMAIN as string;

export const BE_HOST = process.env.BE_HOST as string;

export const FE_HOST = process.env.FE_HOST as string;

export const SERVER_PORT = (process.env.PORT as string) ?? 3000;

export const KAKAO_REDIRECT_URI = `http://${BE_HOST}/auth/kakao/callback`;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const BEARER_TOKEN_SECRET = process.env.BEARER_TOKEN_SECRET as string;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const MONTHLY_QUOTA = 4000000;

export const MAX_USER_COUNT = 100;

export const COLUMN_MAP = {
  ks_date: '일자',
  ks_isin: 'ISIN',
  ks_code: '단축코드',
  ks_name: '종목명',
  ks_marketType: '시장구분',
  ks_adjClose: '수정종가',
  ks_openPrice: '시가',
  ks_lowPrice: '저가',
  ks_highPrice: '고가',
  ks_change: '대비',
  ks_changeRate: '등락률',
  ks_tradingVolume: '거래량',
  ks_tradingValue: '거래대금',
  ks_marketCap: '시가총액',
  ks_shareCount: '주식 수',
  ks_eps: 'EPS',
  ks_per: 'PER',
  ks_bps: 'BPS',
  ks_pbr: 'PBR',
  ks_dps: 'DPS',
  ks_dy: 'DY',
  ks_foreignOwn: '외국인 보유량',
  ks_foreignOwnRate: '외국인 지분율',
  ks_foreignLimit: '외국인 한도수량',
  ks_foreignExhaustionRate: '외국인 한도소진율',
  ks_companyCategory: '소속부',
};
