import { Accordion, Alert, Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { FunctionComponent } from 'react';

import useApp from './useApp';

const App: FunctionComponent = () => {
  const {
    data,
    generatedLink,
    handleAmountChange,
    handleCopy,
    handleGenerateLink,
    handleLinkFocus,
    handlePaymentAmountChange,
    handleTextChange,
    hasFailedToGenerateLink,
    hasPageLoaded,
    isLinkGenerating,
    isLinkInvalid,
    linkInputRef,
    paymentData,
  } = useApp();

  if (!hasPageLoaded) {
    return null;
  }

  if (isLinkInvalid) {
    return (
      <Alert variant="danger" className="text-center">
        Kod nije ispravan, <Alert.Link href="/">generiraj novi</Alert.Link> ili provjeri s primateljem.
      </Alert>
    );
  }

  if (paymentData) {
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
          {paymentData.description ? (
            <ListGroup.Item>
              <Form.Group controlId="description">
                <Form.Label>
                  <strong>Opis:</strong>&nbsp;
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="-"
                  value={paymentData.description}
                  onChange={handleTextChange(35)}
                />
              </Form.Group>
            </ListGroup.Item>
          ) : null}
          <ListGroup.Item>
            <Form.Group controlId="amount">
              <Form.Label>
                <strong>Iznos:</strong>&nbsp;
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="0.00"
                value={paymentData.amount}
                onChange={handlePaymentAmountChange}
              />
            </Form.Group>
          </ListGroup.Item>
          <ListGroup.Item>
            <small className="text-muted text-center d-block">
              Slobodno promijeni iznos ili opis ako nije ispravan, barkod će se ažurirat.
            </small>
          </ListGroup.Item>
        </ListGroup>
        <Card.Body>
          <Button variant="outline-secondary" size="sm" className="w-100" href="/">
            Želim generirat novi barkod s drugim detaljima!
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {hasFailedToGenerateLink ? (
        <Alert variant="danger" className="text-center">
          Nešto ne radi, probaj ponovno ili kontaktiraj podršku!
        </Alert>
      ) : null}
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
            <Form.Label>Iznos:</Form.Label>
            <Form.Control type="text" placeholder="0.00" value={data.amount} onChange={handleAmountChange} />
            <Form.Text className="text-muted text-center">
              Možeš pustiti prazno, neka si sami upišu iznos koji trebaju platiti.
            </Form.Text>
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
          {generatedLink ? (
            <InputGroup className="mb-3">
              <Form.Control type="text" readOnly value={generatedLink} onFocus={handleLinkFocus} ref={linkInputRef} />
              <Button variant="secondary" onClick={handleCopy}>
                KOPIRAJ
              </Button>
            </InputGroup>
          ) : (
            <Button disabled={isLinkGenerating} variant="secondary" onClick={handleGenerateLink} className="w-100 mb-3">
              {isLinkGenerating ? 'GENERIRAM...' : 'GENERIRAJ'}
            </Button>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default App;
