const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.API_KEY;

// const waits = async(timer)=>{

//     setTimeout(()=>{
//         return 1;
//     },timer)
// }

// const getLanguageById=(lang)=>{

//     const language={
//         "c++":54,
//         "java":62,
//         "javascript":63
//     }

//     return language[lang.toLowerCase()];
// }

// const submitBatch = async (submissions)=>{

// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': '60a18ce39cmsh85c2d6c2ce3862dp18d5c9jsndd20243c6cb2',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		console.log(response.data);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// return await fetchData();

// }

// const submitToken = async(tokens)=>{
// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     tokens: tokens.join(','),
//     base64_encoded: 'false',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': '60a18ce39cmsh85c2d6c2ce3862dp18d5c9jsndd20243c6cb2',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		console.log(response.data);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }
// while(true)
// {
// const result =  await fetchData();

// const allAnsDeclared = result.submissions.every((r)=> r.status_id>2);

// if(allAnsDeclared)
//     return result.submissions;

// await waits(1000);
// }

// }

// module.exports = {getLanguageById,submitBatch,submitResult};

function getMostUsedLanguage(languageStats) {
  let maxCount = -1;
  let mostUsedLang = '';

  for (let [lang, count] of languageStats.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedLang = lang;
    }
  }

  return mostUsedLang;
}

const getLanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }


    return language[lang.toLowerCase()];
}


const submitBatch = async (submissions)=>{


const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

 return await fetchData();

}


const waiting = async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer);
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async(resultToken)=>{

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}


 while(true){

 const result =  await fetchData();

  const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);

  if(IsResultObtained)
    return result.submissions;

  
  await waiting(1000);
}



}


module.exports = {getLanguageById,submitBatch,submitToken,getMostUsedLanguage};
