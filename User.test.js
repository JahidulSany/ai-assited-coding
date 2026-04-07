import { render, screen } from '@testing-library/react';
import User from './User';

test('renders user name correctly', () => {
  render(<User name="John Doe" />);
  const nameElement = screen.getByTestId('user-card-name');
  expect(nameElement).toHaveTextContent('John Doe');
});
