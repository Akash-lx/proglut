// import React from 'react'
// import { ApiError } from './ApiError';
import unirest from "unirest";

const SendSms = async (msg, msgId, mobile) => {
    let req = await unirest("POST", "https://www.fast2sms.com/dev/bulkV2");


    req.headers({
        "authorization": "X7GPJh1SjYi9tBmayDIrn8LFOqwHlgsWx3CfUbRKue5kMNT4EzcpSiVFvalN5DQGhIEROCn0Tex89jzf"
    });

    req.form({
        "authorization": "X7GPJh1SjYi9tBmayDIrn8LFOqwHlgsWx3CfUbRKue5kMNT4EzcpSiVFvalN5DQGhIEROCn0Tex89jzf",
        "sender_id": "PROGLT",
        "message": msg,
        "template_id": msgId,
        "entity_id": "1701171464892713970",
        "route": "dlt_manual",
        "numbers": mobile,
    });

    req.end(function (res) {
        if (res.error){
            return res.error;
        }
        // console.log(res.body);
        return res.body;
    });
}

export default SendSms
