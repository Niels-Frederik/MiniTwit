import './layout.css';
import Message from '../components/message'
import {fetchData} from '../utils/fetchData'
import {getData} from '../utils/fetchData'
import {postData} from'../utils/fetchData'
import axios from "axios"
import reportWebVitals from '../reportWebVitals';
import { useEffect, useState } from 'react';
import { computeHeadingLevel } from '@testing-library/react';


 function Timeline({ publicTimeline}) {
    const [messages, setMessages] = useState([])
    useEffect(() => {
        const lol = async () => {
            let url = "";
            if (publicTimeline) url = "http://localhost:5000/public_timeline"
            else url = "http://localhost:5000/timeline"
            const res = await axios({
                    method: 'get',
                    url: url,
                    credentials: 'include',
                    withCredentials: true

                })
            if(res.data.length > 0) setMessages(res.data)
        }
        lol()
    }, [])
    console.log("messages", messages)
    return (
        <ul className="messages">
        {
            messages.map(msg => (
            <Message { ...msg } />
        ))}
        </ul>
    )
}

export default Timeline;
