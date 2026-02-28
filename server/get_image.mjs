import {getTuyaIcon} from "./utils.mjs";
import axios from "axios";
import imageToBase64 from 'image-to-base64';

const IMAGE_BASE_URL = 'https://images.tuyacn.com/';

var window = false;

const icon = `${IMAGE_BASE_URL}smart/icon/ay1506337792739cXrIR/02df6a001651f2c77fafd86ff4d1b460.jpg`;

const a = await imageToBase64(icon) // Path to the image
    .then(
        (response) => {
           return response; // "cGF0aC90by9maWxlLmpwZw=="
        }
    )


console.log(a);