export default async function handler(req, res) {
  try {
    // Vercel Storage 연결 시 자동 생성된 환경변수
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      return res.status(500).json({ error: 'Storage 환경변수가 설정되지 않았습니다.' });
    }

    // Redis INCR 명령어: visitor_count 키 값을 1 증가시키고 결과 반환
    const redisRes = await fetch(`${url}/incr/visitor_count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await redisRes.json();
    const count = data.result;

    return res.status(200).json({ count });
  } catch (error) {
    console.error('방문자 카운트 에러:', error);
    return res.status(500).json({ error: '서버 내부 오류' });
  }
}
