import './layout.css';
import Message from '../components/message'
import axios from "axios"
import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {API_BASE_PATH} from '../constants';
import auth from '../util/auth';

 function Timeline({ publicTimeline, userMessages }) {
    const [messages, setMessages] = useState([])
    const [followingOptions, setFollowingOptions] = useState(-1)
    let { username } = useParams();
	const [value, setValue] = useState(0)
	let text = ""

    const history = useHistory();

    useEffect(() => {
        const getTimeline = async () => {
            let url = "";
            if (userMessages) url = API_BASE_PATH() + "/" + username;
            else if (publicTimeline) url = API_BASE_PATH() + "/public_timeline";
            else url = API_BASE_PATH() + "/timeline";
            const res = await axios({
                    method: 'get',
                    url: url,
                    credentials: 'include',
                    withCredentials: true
                })
                .then((res) =>{
                    console.log(res.data.messages);
                    setMessages(res.data.messages);
                    setFollowingOptions(res.data.followedOptions);
                })
                .catch((error) => { 
                    if(error.response.status == 401){
                        alert('Session expired, please login again.');
                        history.push('/logout');
                    }
                    else{
                        alert('Error status code: ' + error.response.status);
                    }
                });

        }
        getTimeline();
    }, [])

	async function submitPost(e) {
		e.preventDefault();
		var body = {
			text: text
		}
		const res = await axios({
			method: "post",
			url: API_BASE_PATH() + "/add_message",
			credentials: 'include',
			withCredentials: true,
			data: body,
		})
		window.location.reload(true)
	}

	function handleChange(e) {
		e.preventDefault();
		text = e.target.value
	}

    async function followUser()
    {
        var userToFollow = messages[0].username
        console.log(userToFollow)
        const res = await axios({
            method: "post",
			url: API_BASE_PATH() + "/" + userToFollow + "/follow",
			credentials: 'include',
			withCredentials: true,
        })
		window.location.reload(true)
    }
    async function unFollowUser()
    {
        var userToFollow = messages[0].username
        console.log(userToFollow)
        const res = await axios({
            method: "delete",
			url: API_BASE_PATH() + "/" + userToFollow + "/unfollow",
			credentials: 'include',
			withCredentials: true,
        })
		window.location.reload(true)
    }
    //0 = this is you
    //1 = you are currently following -> unfollow
    //2 = follow this user

    function followingValue()
    {
        if (userMessages)
        {
            if(!auth.isLoggedIn()){
                return (
                <div>
                    <p>Please login to follow this user</p>
                </div> 
            )}
            else{
                switch(followingOptions)
                {
                    case 0 : 
                        return <div>
                            <p>This is you!</p>
                        </div>
                    case 1 : 
                        return <div>
                            <p>You are currently following this user <a href="#0" onClick={unFollowUser}> Unfollow this user</a></p>
                            </div>
                    case 2 : 
                        return <div>
                            <p>You are not yet following this user <a href="#0" onClick={followUser}> Follow this user</a></p>
                        </div> 
                }
            }

        }
    }

    return (
		<div>
			<div>
				{userMessages ? followingValue():
                    publicTimeline ?
						<h2> Public Timeline </h2> :
						<h2> My Timeline </h2>
				}
				{!publicTimeline && !userMessages ?
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
    //}

}

export default Timeline;
