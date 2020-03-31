import React, { Component } from 'react';

class Test extends Component {

    render() {
        return (
            <div id="content" style={{padding: "10px 10px 20px 20px"}}>
                <h2>Issues</h2>
                <table className="table">
                    <thead id="itemList">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Project Name</th>
                            <th scope="col">Contribution Allowance</th>
                            <th scope="col">Owner Address</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody id="itemList">
                        {this.props.rewardEvents.map((item, key) => {
                            return (
                                <tr key={key}>
                                    <th scope="row">{item.eventID.toString()}</th>
                                    <td>{item.title}</td>
                                    <td>{window.web3.utils.fromWei(item.bountyAmount.toString(), 'Ether')} ETH </td>
                                    <td>{item.sponsorAddress}</td>
                                    <td>{item.status}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Test;
