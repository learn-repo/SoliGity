import React, { useState, useEffect } from "react";
import { participated } from "./requests";
import Card from "react-bootstrap/Card";
import LoggedInTopBar from "./LoggedInTopBar";
import Button from "react-bootstrap/Button";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'

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
                                    <Button variant="success"
                                        onClick={async (event) => {
                                            event.preventDefault();
                                            // FIXME: tmp
                                            // const itemName = this.itemName.value
                                            let bountyAmount = 2;
                                            const sellingPrice = window.web3.utils.toWei(bountyAmount.toString(), 'Ether')
                                            let projectID = 1;
                                            let title = "test";
                                            let sponsorID = 1;
                                            let sponsorName = "zp";

                                            // We need to call this to keep in sync with the create issue 
                                            await props.createIssue(projectID, title, sponsorID, sponsorName, sellingPrice);
                                        }}>Create Issue</Button>

                                    <Button variant="success"
                                        onClick={async (event) => {
                                            event.preventDefault();
                                            // FIXME: tmp
                                            // const itemName = this.itemName.value
                                            let eventID = 1;
                                            let bountyHunterID = 1;
                                            let bountyHunterName = 'daniel';
                                            await props.requestReview(eventID, bountyHunterID, bountyHunterName);
                                        }}>Request Review</Button>

                                    <Button variant="success"
                                        onClick={async (event) => {
                                            event.preventDefault();
                                            // FIXME: tmp
                                            // const itemName = this.itemName.value
                                            let eventID = 1;
                                            await props.approvePR(eventID);
                                        }}>Approve Pull Request</Button>
                                    <Button variant="success"
                                        onClick={async (event) => {
                                            event.preventDefault();
                                            // FIXME: tmp
                                            // const itemName = this.itemName.value
                                            let eventID = 1;
                                            await props.rejectPR(eventID);
                                        }}>Reject Pull Request</Button>
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