const compression = require("compression");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const app = express();
const port = 8080;

require("dotenv").config();

app.use(compression());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const aladinApiKey = process.env.ALADIN_API_KEY || "ttbkjy64781735003";
const aladinApiBaseUrl = "http://www.aladin.co.kr/ttb/api/ItemList.aspx";
const aladinApiSearchUrl = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";
const aladinApiLookUpUrl = "http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx";

const fetchData = async (url, headers = {}) => {
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response
        ? error.response.data.message
        : "API 호출 중 문제가 발생했습니다."
    );
  }
};

app.use(
  compression({
    level: 6,
    threshold: 2 * 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// 각 카테고리의 책 목록을 페이지별로 제공하는 라우트들
app.get("/bestseller", async (req, res) => {
  const queryType = "Bestseller";
  const page = parseInt(req.query.page) || 1;
  const maxResults = 10;
  const start = (page - 1) * maxResults + 1;
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=${maxResults}&start=${start}&SearchTarget=Book&output=js&Cover=Big&CategoryId&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/newbooks", async (req, res) => {
  const queryType = "ItemNewAll";
  const page = parseInt(req.query.page) || 1;
  const maxResults = 10;
  const start = (page - 1) * maxResults + 1;
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=${maxResults}&start=${start}&SearchTarget=Book&output=js&Cover=Big&CategoryId&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/special", async (req, res) => {
  const queryType = "ItemNewSpecial";
  const page = parseInt(req.query.page) || 1;
  const maxResults = 10;
  const start = (page - 1) * maxResults + 1;
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=${maxResults}&start=${start}&SearchTarget=Book&output=js&Cover=Big&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/BlogBest", async (req, res) => {
  const queryType = "BlogBest";
  const page = parseInt(req.query.page) || 1;
  const maxResults = 10;
  const start = (page - 1) * maxResults + 1;
  const aladinApiUrl = `${aladinApiBaseUrl}?ttbkey=${aladinApiKey}&QueryType=${queryType}&MaxResults=${maxResults}&start=${start}&SearchTarget=Book&output=js&Cover=Big&Version=20131101`;

  try {
    const data = await fetchData(aladinApiUrl);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { isbn, searchQuery } = req.query;
    let aladinApiUrl = "";

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

    const aladinData = await fetchData(aladinApiUrl);
    res.json({ aladinData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
