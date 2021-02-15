import './layout.css';
import Message from '../components/message'
import axios from "axios"
import { useEffect, useState } from 'react';


 function Timeline({ publicTimeline }) {
    const [messages, setMessages] = useState([])
    useEffect(() => {
        const getTimeline = async () => {
            let url = "";
            if (publicTimeline) url = "http://localhost:5000/public_timeline";
            else url = "http://localhost:5000/timeline";
            const res = await axios({
                    method: 'get',
                    url: url,
                    credentials: 'include',
                    withCredentials: true
                })
            if(res.data.length > 0) setMessages(res.data);
        }
        getTimeline()
    }, [])
    console.log("messages", messages);
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
