import React from 'react';

const CoverCard = () => (
  <div>
    <CardDeck>
      <Card style={{ width: '30rem', color: 'white' }}>
        <Card.Img src={source1} alt="Card image" />
        <Card.ImgOverlay>
          <Card.Title>Making it Real</Card.Title>
          <Card.Text>
            A timeless first and a vibrant way to touch up both your digital and IRL identity
          </Card.Text>
          <Button variant="primary">Discover</Button>
        </Card.ImgOverlay>
      </Card>

      <Card style={{ width: '30rem', color: 'white' }}>
        <Card.Img src={source2} alt="Card image" />
        <Card.ImgOverlay>
          <Card.Title>Essence of Nature</Card.Title>
          <Card.Text>
            Nature's first green is gold, infused in a liquor that will make it truly last forever
          </Card.Text>
          <Button variant="primary">Discover</Button>
        </Card.ImgOverlay>
      </Card>
    </CardDeck>
  </div>
);

export default CoverCard;
