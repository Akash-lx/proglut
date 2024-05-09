// import React from 'react'
import { ApiError } from './ApiError.js';
import axios from "axios";

const SendSms = async (msg, msgId, mobile) => {

    try {
        const formData = new FormData();
        formData.append('authorization', 'X7GPJh1SjYi9tBmayDIrn8LFOqwHlgsWx3CfUbRKue5kMNT4EzcpSiVFvalN5DQGhIEROCn0Tex89jzf');
        formData.append('sender_id', 'PROGLT');
        formData.append('message', msg);
        formData.append('template_id', msgId);
        formData.append('entity_id', '1701171464892713970');
        formData.append('route', 'dlt_manual');
        formData.append('numbers', mobile);

        const req = await axios.post('https://www.fast2sms.com/dev/bulkV2', formData, {
            headers: {
                "authorization": "X7GPJh1SjYi9tBmayDIrn8LFOqwHlgsWx3CfUbRKue5kMNT4EzcpSiVFvalN5DQGhIEROCn0Tex89jzf"
            }
        });

        if(req){
            return req.data;
        }else {
            return req.data;
            // throw new ApiError(500,'Server Error in SendSms funcation',req.data)
        }

    } catch (error) {
        // console.log(error);
        throw new ApiError(error.statusCode || 500, error.message || 'Server Error in SmsSend')
    }

}

export default SendSms
