import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { summaryDonations } from './helpers';
import './styles.css';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  grid-gap:1rem;
`;

const Card = styled.div`
  position: relative;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 20px 40px -14px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}`;

const Popup = styled.div`
    position: absolute;
    display:flex;
    color: rgb(255, 255, 255);
    height:100%;
    width: 100%;
    background: white;
    opacity: 93%;
}`;

const Flex = styled.div`
  display: flex;
  justify-content: center;
}`;



export default connect((state) => state)(
  class App extends Component {
    state = {
      charities: [],
      selectedAmount: 10,
      selectedCharityId: null
    };

    componentDidMount() {
      const self = this;
      fetch('http://localhost:3001/charities')
        .then(function (resp) {
          return resp.json();
        })
        .then(function (data) {
          self.setState({ charities: data });
        });

      fetch('http://localhost:3001/payments')
        .then(function (resp) {
          return resp.json();
        })
        .then(function (data) {
          self.props.dispatch({
            type: 'UPDATE_TOTAL_DONATE',
            amount: summaryDonations(data.map((item) => item.amount)),
          });
        });
    }

    handleMessage(msg) {
      const self = this;
      self.props.dispatch({
        type: 'UPDATE_MESSAGE',
        message: msg,
      });
    }

    handleAmount = (amount) => {
      const self = this;
      this.setState({
        selectedAmount: amount
      });
      self.handleMessage('')

    };

    handleSelected = (id) => {
      const self = this;
      self.handleMessage('')
      this.setState({
        selectedCharityId: id
      });
    };

    handlePay = (id, amount, currency) => {
      const self = this;
      fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'charitiesId': id, 'amount': amount, 'currency': currency })
      }).then(function (resp) {
        return resp.json();
      }).then((data) => {
        self.props.dispatch({
          type: 'UPDATE_TOTAL_DONATE',
          amount: data.amount,
        })
        self.handleMessage('Thank you for your donate')
      });
    }

    validateAmount = (item) => {
      const self = this;
      if (self.state.selectedAmount > 0) {
        self.handlePay.call(
          self,
          item.id,
          self.state.selectedAmount,
          item.currency
        )
        self.handleAmount(null)
      }
    }

    render() {
      const self = this;
      const cards = this.state.charities.map(function (item, i) {
        const payments = [10, 20, 50, 100, 500].map((amount, j) => (
          <label key={j}>
            <input
              type="radio"
              checked={self.state.selectedAmount===amount}
              name={`payment_${item.id}`}
              onChange={function () {
                self.handleAmount(amount);
              }}
            />
            {amount}
          </label>
        ));
        return (
          <Card key={i}>
            <div className="card__display">
              <div className="card__image">
                <img src={`./images/${item.image}`} />
              </div>
              <div className="card__content">
                <div className="card__title">{item.name}</div>
                <button className="btn card__btn"
                  onClick={function () {
                    self.handleSelected(item.id);
                  }}
                >Donation
                </button>
              </div>
            </div>
            <Popup key={i} style={{ display: self.state.selectedCharityId === item.id ? 'flex' : 'none' }}>
              <div className="pop_container">
                <div className="close"
                  onClick={function () {
                    self.handleSelected(null);
                  }}>
                  X
                </div>
                <span>Select the amount to donation(USD)</span>
                <Flex>{payments}</Flex>
                <Flex>
                  <button
                    className="btn"
                    onClick={() => self.validateAmount(item)}>
                    Pay
                  </button>
                </Flex>
              </div>
            </Popup>
          </Card>
        );
      });

      const donate = this.props.donate;
      const message = this.props.message;

      return (
        <Flex style={{ 'flexDirection': 'column' }}>
          <h1 style={{ 'margin': 'auto' }}>Tamboon React</h1>
          <p>All donations: {donate} USD</p>
          <div className='message' style={{ display: self.props.message ? 'block' : 'none' }}>
            {message}
          </div>
          <Container>
            {cards}
          </Container>
        </Flex >
      );
    }
  }
);
