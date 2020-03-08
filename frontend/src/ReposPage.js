import React, { useState, useEffect } from "react";
import { repos, createIssue, repoFork, createPR } from "./requests";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import LoggedInTopBar from "./LoggedInTopBar";

function ReposPage() {
    const [initialized, setInitialized] = useState(false);
    const [repositories, setRepositories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const getRepos = async page => {
        const response = await repos(page);
        setRepositories(response.data.data);
        setTotalPages(Math.ceil(response.data.size / response.data.pagelen));
    };

    const fCreateIssue = async () => {
        let data = {
            owner: "soligity2",
            repo: "test3",
            title: "test test",
            body: "test test test test test"
        }
        const response = await createIssue(data);
    }

    const fRepoFork = async () => {
        let data = {
            owner: "soligity2",
            repo: "test4",
        }
        const response = await repoFork(data);
    }

    const fCreatePR = async () => {
        let data = {
            owner: "soligity2",
            repo: "test4",
            title: "okok",
            head: "soligity1:master",
            base: "master"
        }
        const response = await createPR(data);
    }


    useEffect(() => {
        if (!initialized) {
            getRepos(1);
            setInitialized(true);
        }
    });
    return (
        <div>
            <LoggedInTopBar />
            <h1 className="text-center">Your Repositories</h1>
            <div className="btn btn-primary" onClick={() => fCreateIssue()}>
                Create Issue
            </div>

            <div className="btn btn-primary" onClick={() => fRepoFork()}>
                Fork Repo
            </div>

            <div className="btn btn-primary" onClick={() => fCreatePR()}>
                Create Pull Request
            </div>

            {repositories.map((r, i) => {
                return (
                    <Card style={{ width: "90vw", margin: "0 auto" }} key={i}>
                        <Card.Body>
                            <Card.Title>{r.name}</Card.Title>
                            <Link className="btn btn-primary" to={`/commits?repo=${r.full_name}`}>
                                Go
              </Link>
                        </Card.Body>
                    </Card>
                );
            })}
            <br />
            <Pagination style={{ width: "90vw", margin: "0 auto" }}>
                <Pagination.First onClick={() => getRepos(1)} />
                <Pagination.Prev
                    onClick={() => {
                        let p = page - 1;
                        getRepos(p);
                        setPage(p);
                    }}
                />
                <Pagination.Next
                    onClick={() => {
                        let p = page + 1;
                        getRepos(p);
                        setPage(p);
                    }}
                />
                <Pagination.Last onClick={() => getRepos(totalPages)} />
            </Pagination>
            <br />
        </div>
    );
}
export default ReposPage;