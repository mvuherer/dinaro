import { Accordion, Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { FunctionComponent, ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import generateHUB3 from './generateHUB3';

const BASE_LINK = 'https://uplatimi.com';
const STORAGE_KEY = 'dinaro_data';

type Data = {
  amount: string;
  purpose: string;
  description: string;
  iban: string;
  model: string;
  reference: string;
  receiverName: string;
  receiverStreet: string;
  receiverPlace: string;
};

const App: FunctionComponent = () => {
  const [data, setData] = useState<Data>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '""') || {
      amount: '',
      purpose: '',
      description: '',
      iban: '',
      model: 'HR99',
      reference: '',
      receiverName: '',
      receiverStreet: '',
      receiverPlace: '',
    }
  );
  const [paymentData, setPaymentData] = useState<Data | null>(null);
  const [generatedLink, setGeneratedLink] = useState(BASE_LINK);
  const [hasLoaded, setHasLoaded] = useState(false);

  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.payment) {
      const parsedData = JSON.parse(params.payment);

      setPaymentData(parsedData);
      generateHUB3(parsedData);
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    const stringifiedData = JSON.stringify(data);

    localStorage.setItem(STORAGE_KEY, stringifiedData);

    setGeneratedLink(`${BASE_LINK}?payment=${encodeURI(stringifiedData)}`);

    generateHUB3(data);
  }, [data]);

  const handleAmountChange = useCallback(({ target: { value } }) => {
    let amount = value.replace(/[^0-9.,]/gi, '');

    if (amount) {
      if (amount.includes(',') || amount.includes('.')) {
        const parts = amount.split(/[,.]/);

        amount = `${parseInt(parts[0], 10)}.${parts[1] ? parts[1].slice(0, 2) : ''}`;
      } else {
        amount = parseInt(amount, 10).toString();
      }
    }

    setData((current) => ({ ...current, amount: amount.slice(0, 15) }));
  }, []);

  const handleTextChange = useCallback(
    (limit) => (event: ChangeEvent<HTMLInputElement>) => {
      setData((current) => ({ ...current, [event.target.id]: event.target.value.slice(0, limit) }));
    },
    []
  );

  const handleLinkFocus = useCallback((event) => event.target.select(), []);

  const handleCopy = useCallback(() => {
    linkInputRef?.current?.focus();
    linkInputRef?.current?.select();
    document.execCommand('copy');
  }, [linkInputRef]);

  if (!hasLoaded) {
    return null;
  }

  if (paymentData) {
    if (paymentData.receiverName || paymentData.iban || paymentData.amount || paymentData.description) {
      return (
        <Card>
          <ListGroup variant="flush">
            {paymentData.receiverName ? (
              <ListGroup.Item>
                <strong>Za:</strong> {paymentData.receiverName}
              </ListGroup.Item>
            ) : null}
            {paymentData.iban ? (
              <ListGroup.Item>
                <strong>IBAN:</strong> {paymentData.iban}
              </ListGroup.Item>
            ) : null}
            {paymentData.amount ? (
              <ListGroup.Item>
                <strong>Iznos:</strong> {paymentData.amount} HRK
              </ListGroup.Item>
            ) : null}
            {paymentData.description ? (
              <ListGroup.Item>
                <strong>Opis:</strong> {paymentData.description}
              </ListGroup.Item>
            ) : null}
          </ListGroup>
          <Card.Body>
            <Button variant="outline-secondary" size="sm" className="w-100" href="/">
              GENERIRAJ NOVI
            </Button>
          </Card.Body>
        </Card>
      );
    }

    return null;
  }

  return (
    <Card>
      <Card.Body>
        <Form.Group className="mb-3" controlId="iban">
          <Form.Label>IBAN za uplatu:</Form.Label>
          <Form.Control
            type="text"
            placeholder="HR*******************"
            value={data.iban}
            onChange={handleTextChange(21)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="amount">
          <Form.Label>Iznos</Form.Label>
          <Form.Control type="text" placeholder="0.00" value={data.amount} onChange={handleAmountChange} />
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>Opis:</Form.Label>
          <Form.Control type="text" placeholder="-" value={data.description} onChange={handleTextChange(35)} />
        </Form.Group>
      </Card.Body>
      <Accordion flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Primatelj</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3" controlId="receiverName">
              <Form.Label>Naziv:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ivo Sanader"
                value={data.receiverName}
                onChange={handleTextChange(25)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="receiverStreet">
              <Form.Label>Adresa:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ul. dr. Luje Naletilića 1"
                value={data.receiverStreet}
                onChange={handleTextChange(25)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="receiverPlace">
              <Form.Label>Mjesto:</Form.Label>
              <Form.Control
                type="text"
                placeholder="10000, Zagreb"
                value={data.receiverPlace}
                onChange={handleTextChange(27)}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Model i opis</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3" controlId="receiver.model">
              <Form.Label>Model:</Form.Label>
              <Form.Control type="text" placeholder="HR99" value={data.model} onChange={handleTextChange(4)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="receiver.reference">
              <Form.Label>Poziv na broj:</Form.Label>
              <Form.Control
                type="text"
                placeholder="08-06-1953"
                value={data.reference}
                onChange={handleTextChange(22)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="purpose">
              <Form.Label>Šifra namjene:</Form.Label>
              <Form.Control type="text" placeholder="OTHR" value={data.purpose} onChange={handleTextChange(4)} />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Card.Body>
        <InputGroup className="mb-3">
          <Form.Control type="text" readOnly value={generatedLink || ''} onFocus={handleLinkFocus} ref={linkInputRef} />
          <Button variant="secondary" onClick={handleCopy}>
            KOPIRAJ
          </Button>
        </InputGroup>
        <Form.Group className="mb-3" controlId="linkToShare"></Form.Group>
      </Card.Body>
    </Card>
  );
};

export default App;
