// compression 모듈을 불러옴
const compression = require("compression");
// express 모듈을 불러옴
const express = require("express");
// cors 모듈을 불러옴, CORS 문제를 처리하기 위해 사용
const cors = require("cors");
// morgan 모듈을 불러옴, HTTP 요청 로거로 사용
const morgan = require("morgan");
// axios 모듈을 불러옴, HTTP 클라이언트로 사용
const axios = require("axios");
// Express 인스턴스를 생성, 이 인스턴스를 일반적으로 '앱'이라고 함
const app = express();
// 서버가 사용할 포트 번호 설정
const port = 8080;

// 환경변수를 불러오기 위한 dotenv 모듈 활성화
require("dotenv").config();

// 미들웨어를 Express 앱에 '장착'
// 압축 미들웨어를 사용하여 응답 데이터를 압축함
app.use(compression());
// 개발 환경에서 HTTP 요청에 대한 로그를 출력하기 위한 morgan 미들웨어 설정
app.use(morgan("dev"));
// CORS 문제를 방지하기 위한 CORS 미들웨어 사용
app.use(cors());
// 들어오는 요청의 본문을 JSON으로 파싱하기 위한 미들웨어 설정
app.use(express.json());

// 환경변수에서 API 키를 불러옴
const aladinApiKey = "ttblazy_dog1954001";
// 알라딘과 네이버 API의 기본 URL 설정
const aladinApiBaseUrl = "http://www.aladin.co.kr/ttb/api/ItemList.aspx";
const aladinApiSearchUrl = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";
const aladinApiLookUpUrl = "http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx";

// 비동기 데이터 패치 함수
const fetchData = async (url, headers = {}) => {
  try {
    console.log("url, headers", url, headers);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.log(error.response.message);
    throw new Error("에러 발생");
  }
};
app.use(
  // 압축 미들웨어 설정
  compression({
    level: 6, // 압축 레벨 설정, 0(압축 없음)에서 9(최대 압축)까지
    threshold: 2 * 1024, // 압축을 적용하기 전 최소 파일 크기를 2KB로 설정
    filter: (req, res) => {
      // 압축을 적용할 요청을 결정하는 함수
      if (req.headers["x-no-compression"]) {
        // 요청 헤더에 x-no-compression이 있으면 압축 적용 안 함
        return false;
      }
      // 그 외 요청에 대해서는 기본 압축 필터 적용
      return compression.filter(req, res);
    },
  })
);
// 베스트셀러 목록을 가져오는 라우트
app.get("/bestseller", async (req, res) => {
  const queryType = "Bestseller";
  // 알라딘 API의 베스트셀러 리스트에 대한 URL 생성
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=100&start=1&SearchTarget=Book&output=js&Cover=Big&CategoryId&Version=20131101`;

  try {
    // fetchData 함수를 사용하여 데이터를 가져옴
    const data = await fetchData(aladinApiUrl);
    // 데이터를 JSON 형식으로 클라이언트에 응답
    res.json(data);
  } catch (error) {
    // 에러 발생 시 500 상태 코드와 에러 메시지를 JSON 형식으로 응답
    res.status(500).json({ error: error.message });
  }
});
// 신간 목록을 가져오는 라우트
app.get("/newbooks", async (req, res) => {
  const queryType = "ItemNewAll";
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=100&start=1&SearchTarget=Book&output=js&Cover=Big&CategoryId&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 특별 선정 목록을 가져오는 라우트
app.get("/special", async (req, res) => {
  const queryType = "ItemNewSpecial";
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=100&start=1&SearchTarget=Book&output=js&Cover=Big&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//블로거 베스트셀러
app.get("/BlogBest", async (req, res) => {
  const queryType = "BlogBest";
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=100&start=1&SearchTarget=Book&output=js&Cover=Big&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 책 검색 결과를 가져오는 라우트
app.get("/search", async (req, res) => {
  try {
    // 쿼리스트링에서 isbn과 검색어를 추출
    const { isbn, searchQuery } = req.query;
    let aladinApiUrl = "";

    // isbn 또는 검색어가 없으면 에러 응답
    if (!isbn && !searchQuery) {
      return res
        .status(400)
        .json({ error: "ISBN 정보 또는 검색어가 필요합니다." });
    }

    if (isbn) {
      aladinApiUrl = `${aladinApiLookUpUrl}?ttbkey=${aladinApiKey}&itemIdType=ISBN&ItemId=${isbn}&output=js&Cover=Big&Version=20131101&CategoryId`;
    } else {
      aladinApiUrl = `${aladinApiSearchUrl}?ttbkey=${aladinApiKey}&Query=${encodeURIComponent(
        searchQuery
      )}&MaxResults=100&start=1&SearchTarget=Book&output=js&Cover=Big&Version=20131101&CategoryId`;
    }

    // 알라딘 API에 데이터 요청을 보냄
    const aladinData = await fetchData(aladinApiUrl);

    // 알라딘 API로부터 받은 데이터를 JSON 형식으로 응답
    res.json({ aladinData });
  } catch (error) {
    console.log("에러", error);
    console.log("에러", error.response);
    res.status(500).json({ error: error.message });
  }
});

// 포트 8080에서 서버를 시작함
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
