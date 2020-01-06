import axios from 'axios'
import * as Expo from "expo";

const { manifest } = Expo.Constants;
const api = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
  ? manifest.debuggerHost.split(`:`).shift().concat(`:3000`)
  : `api.example.com`;
  
let helpers = {
  
  login: (email, password) => {
    return axios({
      method : 'POST',
      url : `http://${api}/authenticate`,
      data : {
        email : email,
        password : password
      },
      headers : {
        'Content-Type' : 'application/json',
        'Accept' : '*/*',
        'Access-Control-Allow-Origin' : '*'
      }
    })
    .then(response => {
      console.log(response)
      return response.data
    })
    .catch(error => {
      return { error : error }
    })
  }
}

export default helpers

