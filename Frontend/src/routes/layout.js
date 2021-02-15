import './layout.css';
import { Link, Route, useHistory } from 'react-router-dom'
import Login from './login'
import Register from './register'
import Timeline from './timeline'
import React, { useState } from 'react';
import axios from "axios";

const username = "norton"

function Layout() {
    const [loggedIn, setLoggedIn] = useState(false);
    const history = useHistory();

    function isLoggedIn(){
        if(loggedIn){
            return(
                <>
                    <Link to="/timeline">my timeline</Link>
                    <Link to="/public_timeline">public timeline</Link>
                    <Link 
                        to="/logout"
                        onClick={ async () => {
                            await axios({
                                method: 'get',
                                url: 'http://localhost:5000/logout',
                                credentials: 'include',
                                withCredentials: true
                            })
                            .then(() => {
                                alert('Logged out');
                                setLoggedIn(false);
                                history.push('/public_timeline');
                            }, () => {
                                alert('Failed to log out');
                            })
                        }}
                    >
                        sign out {username}
                    </Link>
                </>
            )
        }
        else{
            return(
                <>
                    <Link to="/public_timeline">public timeline</Link>
                    <Link to="/register">sign up</Link>
                    <Link to="/login">sign in</Link>
                </>
            )
        }
    }

    return (
        <div className="page">
            <h1>MiniTwit</h1>
            <div className="navigation">
                {isLoggedIn()}
            </div>
            <div className="body">
                <Route 
                    path="/public_timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={true} />
                    )}
                />
                <Route 
                    path="/timeline" 
                    render={(props) => (
                        <Timeline {...props} publicTimeline={false} />
                    )}
                />
                <Route 
                    path="/login" 
                    render={(props) => (
                        <Login {...props} setLoggedIn={setLoggedIn} />
                    )}
                />
                <Route path="/register" component={Register}/>
            </div>
            <div className="footer">
                MiniTwit &mdash; A Flask Application
            </div>
        </div>
    );
}

export default Layout;
