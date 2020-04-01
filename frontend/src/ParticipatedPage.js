import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import LoggedInTopBar from "./LoggedInTopBar";
import { participated } from "./requests";

function ParticipatedPage(props) {
    const [initialized, setInitialized] = useState(false);
    const [participatedRepos, setParticipatedRepos] = useState([]);

    const getParticipated = async () => {
        const response = await participated();
        setParticipatedRepos(response.data);
    };

    useEffect(() => {
        if (!initialized) {
            getParticipated();
            setInitialized(true);
        }
    });

    return (
        <>
            <LoggedInTopBar />
            <div className="page">
                <h1 className="text-center">Participated Repositories</h1>
                {participatedRepos.map(rc => {
                    return (
                        <Card style={{ width: "90vw", margin: "0 auto" }}>
                            <Card.Body>
                                <Card.Title>{rc.name}</Card.Title>
                                <p>Owner: {rc.owner}</p>
                                <Card.Text>{rc.description}</Card.Text>
                                <ButtonToolbar>
                                    <Button variant="success" href={rc.url}>Repo Link</Button>
                                    <Link className="btn btn-primary" to={`/repo?repo=${rc.name}&?owner=${rc.owner}`}>Go</Link>
                                </ButtonToolbar>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
export default ParticipatedPage;