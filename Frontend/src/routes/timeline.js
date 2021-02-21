import './layout.css';
import Message from '../components/message'
import axios from "axios"
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


 function Timeline({ publicTimeline, userMessages }) {
    const [messages, setMessages] = useState([])
    //var messages = []

    let { username } = useParams();
    useEffect(() => {
        const getTimeline = async () => {
            let url = "";
            if (userMessages) url = "http://localhost:5000/" + username;
            else if (publicTimeline) url = "http://localhost:5000/public_timeline";
            else url = "http://localhost:5000/timeline";
            const res = await axios({
                    method: 'get',
                    url: url,
                    credentials: 'include',
                    withCredentials: true
                })
            //if(res.data.length > 0) 
            setMessages(res.data);
            //messages = res.data
        }
        getTimeline()
    }, [])
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
