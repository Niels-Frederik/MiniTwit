import React from 'react';
import './layout.css';
import Message from '../components/message'
import axios from "axios"
import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {API_BASE_PATH} from '../constants';
import auth from '../util/auth';
import PropTypes from 'prop-types';

 function Timeline({ publicTimeline, userMessages }) {
    const [messages, setMessages] = useState([])
    const [followingOptions, setFollowingOptions] = useState(-1)
    let { username } = useParams();
	let text = "";

    const history = useHistory();

    useEffect(() => {
        const getTimeline = async () => {
            let url = "";
            if (userMessages) url = API_BASE_PATH() + "/" + username;
            else if (publicTimeline) url = API_BASE_PATH() + "/public_timeline";
            else url = API_BASE_PATH() + "/timeline";
            await axios({
                    method: 'get',
                    url: url,
                    credentials: 'include',
                    withCredentials: true
                })
                .then(res => {
                    console.log(res.data.messages);
                    setMessages(res.data.messages);
                    setFollowingOptions(res.data.followedOptions);
                })
                .catch(error => { 
                    console.log(error)
                    if(error.response.status == 401){
                        alert('Session expired, please login again.');
                        history.push('/logout');
                        return;
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
		await axios({
			method: "post",
			url: API_BASE_PATH() + "/add_message",
			credentials: 'include',
			withCredentials: true,
			data: body,
		})
		window.location.reload(true);
	}

	function handleChange(e) {
		e.preventDefault();
		text = e.target.value
	}

    async function followUser()
    {
        var userToFollow = messages[0].username
        console.log(userToFollow)
        await axios({
            method: "post",
			url: API_BASE_PATH() + "/" + userToFollow + "/follow",
			credentials: 'include',
			withCredentials: true,
        })
		window.location.reload();
    }
    async function unFollowUser()
    {
        var userToFollow = messages[0].username
        console.log(userToFollow)
        await axios({
            method: "delete",
			url: API_BASE_PATH() + "/" + userToFollow + "/unfollow",
			credentials: 'include',
			withCredentials: true,
        })
		window.location.reload();
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
                            <h2>{username}&apos;s timeline</h2>
                            <p>This is you!</p>
                        </div>
                    case 1 : 
                        return <div>
                            <h2>{username}&apos;s timeline</h2>
                            <p>You are currently following this user <a href="#0" onClick={unFollowUser}> Unfollow this user</a></p>
                            </div>
                    case 2 : 
                        return <div>
                            <h2>{username}&apos;s timeline</h2>
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
					<p> What is on your mind	username? </p>
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
				<Message key={msg.username} { ...msg } />
			))}
			</ul>
		</div>
    )
    //}

}

Timeline.propTypes = {
    publicTimeline: PropTypes.bool.isRequired,
    userMessages: PropTypes.bool.isRequired,
  };

export default Timeline;
