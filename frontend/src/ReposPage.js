import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Pagination from "react-bootstrap/Pagination";
import { Link } from "react-router-dom";
import LoggedInTopBar from "./LoggedInTopBar";
import "./ReposPage.css";
import { participate, repos } from "./requests";

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

    const participateRepo = async (fullname) => {
        let data = { repoPath: fullname }
        const response = await participate(data);
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

            {repositories.map((r, i) => {
                return (
                    <Card style={{ width: "90vw", margin: "0 auto" }} key={i}>
                        <Card.Body>
                            <Card.Title>{r.name}</Card.Title>
                            <Card.Text>{r.description ? r.description : "No Description."}
                            </Card.Text>
                            <Link className="btn btn-success" onClick={() => participateRepo(r.full_name)}>
                                Participate
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