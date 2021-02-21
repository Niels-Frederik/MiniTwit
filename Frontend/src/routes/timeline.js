import './layout.css';
import Message from '../components/message'
import axios from "axios"
import { useEffect, useState } from 'react';


 function Timeline({ publicTimeline }) {
    const [messages, setMessages] = useState([])
	const [value, setValue] = useState(0)
	let text = ""
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


	async function submitPost(e) {
		e.preventDefault();
		console.log(text)
		var body = {
			text: text
		}
		const res = await axios({
			method: "post",
			url: "http://localhost:5000/add_message",
			credentials: 'include',
			withCredentials: true,
			data: body,
		})
		console.log(res)
		window.location.reload(true)
	}

	function handleChange(e) {
		e.preventDefault();
		text = e.target.value
	}

    return (
		<div>
			<div>
				{publicTimeline ? 
						<h2> Public Timeline </h2> :
						<h2> My Timeline </h2>
				}
				{!publicTimeline ?
				<div>
					<p> What's on your mind	username? </p>
					<div>
						<input type="name" onChange={handleChange} />
						<button onClick={submitPost}> Share </button>
					</div>
				</div> 
				: null}
			</div>
			<ul className="messages">
			{
				messages.map(msg => (
				<Message { ...msg } />
			))}
			</ul>
		</div>
    )
}

export default Timeline;
