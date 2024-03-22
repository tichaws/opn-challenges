import React, { useEffect } from 'react';
import fetch from 'isomorphic-fetch';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { summaryDonations } from './helpers';
import './styles.css';

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const Flex = styled.div`
  display: flex;
  justify-content: center;
}`;

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

const CardTitle = styled.div`
  display: flex;
  color: black;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 2px;
  margin-top: auto;
  margin-bottom: auto;
`

const CardDisplay = styled.div`
  border-radius: 32px;
  width: 25rem;
}`;

const CardImage = styled.div`
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  filter: contrast(100%);
  overflow: hidden;
  position: relative;
  height: 10em;
  width: 28rem;
  transition: filter 0.5s cubic-bezier(.43, .41, .22, .91);
}`;


const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}`;

const CardBtn = styled.div`
  background-color: white;
  border: 1px solid blue;
  color: blue;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
`

const Popup = styled.div`
  position: absolute;
  display:flex;
  color: rgb(255, 255, 255);
  height:100%;
  width: 100%;
  background: white;
  opacity: 93%;
}`;

const PopContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  color: black;
  grid-gap: 1rem;
}`;

const PopCloseBtn = styled.div`
  position: absolute;
  float: right;
  color: grey;
  background: transparent;
  border: 0;
  top: 0;
  right: 0;
  padding: 1rem;
  cursor: pointer;

  &:hover {
    color: black;
  }
}`;

const Btn = styled.div`
  background-color: white;
  border: 1px solid blue;
  color: blue;
  padding: 0.5rem;
  cursor: pointer;
`

const Message = styled.div`
  color: white;
  margin: 1em 0px;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  background: cadetblue;
  padding: 6px;
  border-radius: 10px;
`

const App = (props) => {
  const [selectedAmount, setSelectedAmount] = React.useState(0);
  const [charities, setCharities] = React.useState([]);
  const [selectedCharityId, setSelectedCharityId] = React.useState(0);
  const [paymentAmount] = React.useState([10, 20, 50, 100, 500]);
  
  const geturl = (path) => {
    return `http://localhost:3001/${path}`
  };

  const handleMessage = (msg) => {
    props.dispatch({
      type: 'UPDATE_MESSAGE',
      message: msg,
    });
  }

  const handleTotalAmount = (amount) => {
    props.dispatch({
      type: 'UPDATE_TOTAL_DONATE',
      amount,
    });
  }

  const fetchCharities = () => {
    fetch(geturl('charities'))
      .then((res) => res.json())
      .then((data) => {
        setCharities(data);
      });
  };

  const fetchPayments = () => {
    fetch(geturl('payments'))
      .then((res) => res.json())
      .then((data) => {
        handleTotalAmount(summaryDonations(data.map((item) => item.amount)));
      });
  };

  const handleAmount = (amount) => {
    setSelectedAmount(amount);
    handleMessage('')
  };

  const handleSelected = (id) => {
    handleMessage('')
    setSelectedCharityId(id);
  };

  useEffect(() => {
    console.log(props);
    fetchCharities();
    fetchPayments();
  }, [])

  const handlePay = (id, amount, currency) => {
    fetch(geturl('payments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ charitiesId: id, amount, currency}),
    })
    .then((res) => res.json())
    .then((data) => {
      handleTotalAmount(data.amount);
      handleMessage('Thank you for your donate')
    });
  }

  const validateAmount = (item) => {
    if (selectedAmount > 0) {
      handlePay.call(
        selectedCharityId,
        item.id,
        selectedAmount,
        item.currency
      )
      handleAmount(null)
    }
  }

  const Tiele = ({ text }) => {
    return <h1 style={{ margin: 'auto' }}>{text}</h1>;
  };

  const radioSelect = (onselect, charitiesId) => {
    return paymentAmount.map((amount, j) => (
      <label key={j}>
        <input
          type="radio"
          checked={selectedAmount === amount}
          name={`payment_${charitiesId}`}
          onChange={() => onselect(amount)}
        />
        {amount}
      </label>
    ));
  }

  const selectMode = (item, onclose, onpay, payments) => {
    return <Popup style={{ display: selectedCharityId === item.id ? 'flex' : 'none' }}>
      <PopContainer>
        <PopCloseBtn
          onClick={() => onclose()}>
          X
        </PopCloseBtn>
        <span>Select the amount to donation(USD)</span>
        <Flex>{payments}</Flex>
        <Flex>
          <Btn
            onClick={() => onpay(item)}>
            Pay
          </Btn>
        </Flex>
      </PopContainer>
    </Popup>;
  }

  const cards = charities.map(function (item, i) {

    const payments = radioSelect((amount) => handleAmount(amount), item.id)
    const pop = selectMode(item, () => handleSelected(null), (item) => validateAmount(item), payments)

    return (
      <Card key={i}>
        <CardDisplay >
          <CardImage >
            <img src={`./images/${item.image}`} />
          </CardImage>
          <CardContent >
            <CardTitle>{item.name}</CardTitle>
            <CardBtn
              onClick={function () {
                handleSelected(item.id);
              }}
            >Donation
            </CardBtn>
          </CardContent>
        </CardDisplay>
        {pop}
      </Card>
    );
  });

  return (
    <div>
      <FlexContainer>
        <Tiele text={'Tamboon React'} />
        <p>All donations: {props.donate} </p>
        <Message style={{ display: props.message ? 'block' : 'none' }}>
          {props.message}
        </Message>
        <Container>
          {cards}
        </Container>
      </FlexContainer >
    </div>
  );
};

const mapStateToProps = function (state) {
  return {
    donate: state.donate,
    message: state.message,
  }
};

export default connect(mapStateToProps)(App);