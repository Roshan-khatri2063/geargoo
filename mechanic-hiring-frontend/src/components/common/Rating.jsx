import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Rating = ({ value, size = 16 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} size={size} color="#facc15" />);
    else if (value >= i - 0.5)
      stars.push(<FaStarHalfAlt key={i} size={size} color="#facc15" />);
    else stars.push(<FaRegStar key={i} size={size} color="#facc15" />);
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Rating;