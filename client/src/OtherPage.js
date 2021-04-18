import React from 'react';
import { Link } from 'react-router-dom';

export default function OtherPage(){
  return (
    <div>
      Some other page.
      <Link to="/">back home</Link>
    </div>
  );
};