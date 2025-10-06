'use client';
import StartButton from './components/StartButton.jsx';
import Image from 'next/image';
import { AnimatedButton } from './components/animated/AnimatedButton.jsx';
import { AnimatedDiv } from './components/animated/AnimatedDiv.jsx';

export default function Page() {
  const randomIndex = Math.floor(Math.random() * 20);
  return (
    <main className="screen">
      <div className="content" style={{ textAlign: 'center' }}>
        <AnimatedDiv direction="down">
          <Image
            src={'/Frame 26.png'}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '40%', height: 'auto' }}
            alt="Logo"
          ></Image>
        </AnimatedDiv>

        <AnimatedDiv direction="down" delay={0.2} hover={1.1}>
          <h1 className="title">CTRL + ALT + PREBUNK</h1>
        </AnimatedDiv>

        <div className="buttons">
          <AnimatedButton className="btn btn-outline" direction="right">
            TUTORIAL
          </AnimatedButton>
          <StartButton />
        </div>
      </div>
    </main>
  );
}
