import { Project, Experience, Skill, Award } from './types';

export const HERO_IMAGE = '/src/assets/images/cyber_robot_hero_1779515176831.png';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'line-tracer',
    title: 'Line Tracing Robot',
    description: '컬러 센서를 사용해 검은 선을 따라가는 로봇 프로젝트입니다.',
    image: '/src/assets/images/line_tracing_1779515195312.png',
    techStack: ['Color Sensor', 'Motor Control', 'Block Coding'],
    longDescription: '고속주행과 정밀한 방향 제어가 가능한 자율주행 라인 트레이서입니다. 5채널 적외선/컬러 센서 어레이를 활용해 노이즈를 필터링하고 선의 중앙 정렬 오차를 실시간으로 계산하는 PID 비례적분미분 알고리즘을 설계했습니다. 코딩의 구조화를 위해 블록 코딩(Block Coding)으로 시작하여 최종 C++ 펌웨어로 튜닝 및 임베디드 검증을 완료했습니다.',
    hardwareSpec: [
      { component: '컨트롤 보드', spec: 'Arduino 기반 Core 보드' },
      { component: '조향 센서', spec: '5채널 IR Reflectance Sensor Array' },
      { component: '구동 모터', spec: '2x High-torque Geared DC 모터' },
      { component: '모터 드라이버', spec: 'L298H Dual H-Bridge 구동 모듈' },
      { component: '배터리', spec: '7.4V 리튬이온 충전 백업쉘' }
    ],
    softwareDetails: '정공법 기반 오차 실시간 가중치 매핑, 적분오차 누적 방지(Anti-windup) 및 미분 예측 제어로 탈선율 0.2% 미만 달성.',
    codeSnippet: `// Line Tracer PID Controller Loop
void loop() {
  int sensorValue0 = analogRead(A0);
  int sensorValue1 = analogRead(A1);
  int sensorValue2 = analogRead(A2); // Center Sensor
  int sensorValue3 = analogRead(A3);
  int sensorValue4 = analogRead(A4);

  // Position weighted error calculation (-2 to +2 range)
  int error = (sensorValue0 * -2 + sensorValue1 * -1 + sensorValue2 * 0 + sensorValue3 * 1 + sensorValue4 * 2);
  
  float Kp = 1.35; // Proportional Gain
  float Kd = 4.20; // Derivative Gain
  float Ki = 0.02; // Integral Gain
  
  float pOffset = error * Kp;
  float dOffset = (error - lastError) * Kd;
  integral = (integral + error) * Ki;
  
  float correction = pOffset + dOffset + integral;
  lastError = error;

  // Actuate Motor Speeds
  int leftSpeed = BASE_SPEED + correction;
  int rightSpeed = BASE_SPEED - correction;
  
  setMotors(leftSpeed, rightSpeed);
  delay(5); // Stabilized 200Hz Control Frequency
}`,
    simulateLogs: [
      { timestamp: '00:01.02', type: 'INFO', message: 'Core System Initialization Started.' },
      { timestamp: '00:01.85', type: 'INFO', message: 'TBR3000-ARRAY sensors calibrate: Success.' },
      { timestamp: '00:02.10', type: 'SUCCESS', message: 'Motor driver connected actively. Target speed: 180 RPM.' },
      { timestamp: '00:03.45', type: 'INFO', message: 'Contact established with track guidelines.' },
      { timestamp: '00:05.12', type: 'WARNING', message: 'Track deviation threshold near +1.8. Engaging Kd derivative override.' },
      { timestamp: '00:06.30', type: 'SUCCESS', message: 'Course corrected back to A2 center sector (Reflectance: 840).' }
    ]
  },
  {
    id: 'sumo-robot',
    title: 'Sumo Robot',
    description: '상대 로봇을 감지하고 밀어내는 로봇 프로젝트입니다.',
    image: '/src/assets/images/sumo_robot_1779515213999.png',
    techStack: ['Ultrasonic Sensor', 'Motor Power', 'Robot Design'],
    longDescription: '금속 재질의 경기장 안에서 상대를 밀어내어 승리하는 자율주행 스모 로봇입니다. 초음파 거리 센서를 통해 적의 거리와 각도를 측정하며 타겟을 지속적으로 추적하고, 동시에 적외선 낙하 방지 센서를 사용하여 원형 경기장 경계선(하얀색)을 자동 인식 후 후진 및 회전 회피 기동을 수행하도록 설계했습니다.',
    hardwareSpec: [
      { component: '컨트롤러', spec: 'Micro-ATmega328P 보드' },
      { component: '적 탐지 센서', spec: '2x HC-SR04 초음파 정밀 거리 센서' },
      { component: '낙하 방지', spec: '2x 하단 장착형 반사형 광센서' },
      { component: '파워트레인', spec: 'Metal Gearbox 1:48 모터 2개' },
      { component: '바퀴 코팅', spec: '접지력 극대화 실리콘 슬릭 트레드' }
    ],
    softwareDetails: '적 탐지 시 풀파워 가속 모드(Overdrive)로 전력 분배, 경계선 감지 시 0.1초 내 180도 회전 기동 상태 전이 자동화 설계.',
    codeSnippet: `// Sumo Robot State Machine Code
void loop() {
  // Check if we are boundary-safe
  bool lineLeft = digitalRead(BOTTOM_SENSOR_LEFT);
  bool lineRight = digitalRead(BOTTOM_SENSOR_RIGHT);

  if (lineLeft == WHITE_LINE || lineRight == WHITE_LINE) {
    // Escape action: Back up and spin
    setMotors(-MAX_SPEED, -MAX_SPEED);
    delay(200);
    setMotors(MAX_SPEED, -MAX_SPEED);
    delay(150);
    return;
  }

  // Combat Mode: Distance scanning
  float range = getUltrasonicDistance();
  if (range > 0 && range <= TARGET_ENGAGE_LIMIT) {
    // Enemy sighted! Charge forward with full power
    setMotors(OVERDRIVE_SPEED, OVERDRIVE_SPEED);
  } else {
    // Search Mode: Spin in place to spot enemy
    setMotors(SEARCH_SPEED, -SEARCH_SPEED);
  }
}`,
    simulateLogs: [
      { timestamp: '00:01.00', type: 'INFO', message: 'Aatmega328P initialized. Diagnostic selftest: OK.' },
      { timestamp: '00:01.40', type: 'INFO', message: 'Ultrasonic sensor array status: ACTIVE, reading 120cm.' },
      { timestamp: '00:02.00', type: 'SUCCESS', message: 'Raging Sumo Algorithm primed. Standby for push command.' },
      { timestamp: '00:05.11', type: 'WARNING', message: 'White border line detected in FRONT! Activating escape vector.' },
      { timestamp: '00:05.45', type: 'INFO', message: 'Escape sequence executed. Rotating 145 degrees.' },
      { timestamp: '00:06.90', type: 'SUCCESS', message: 'Enemy locked at 18cm! Unleashing Full Overdrive!' }
    ]
  },
  {
    id: 'mission-robot',
    title: 'Mission Robot',
    description: '정해진 미션을 수행하기 위해 구조와 코드를 설계한 프로젝트입니다.',
    image: '/src/assets/images/mission_robot_1779515237970.png',
    techStack: ['Mission Strategy', 'Sensor Control', 'Debugging'],
    longDescription: '협동 및 장애물 돌파 미션을 클리어하기 위해 고안된 종합 서보 제어 로봇입니다. 서보 모터 그리퍼, 자이로 센서를 응용한 오르막길 자세 제어, 그리고 무선 원격 디버깅 인터페이스 세팅을 결합했습니다. 재난 지역 구호 등 정교한 작업을 필요로 하는 미션 환경에 뛰어난 신뢰성을 발휘합니다.',
    hardwareSpec: [
      { component: '제어 마이크로', spec: 'ARM Cortex-M 기획 MCU 보드' },
      { component: '머퓰레이터', spec: '2자유도(2-DOF) 고정밀 서보 그리퍼' },
      { component: '균형 센서', spec: 'MPU6050 6축 자이로 가속도계' },
      { component: '샤시 프레임', spec: '다목적 하이-클리어런스 메탈 크롤러 버디' }
    ],
    softwareDetails: '칼만 필터를 적용한 내재적 자세 고정, 그리퍼 서보 미세 파지 각도 튜닝, 미션 시나리오 기반 순차 상태 천이.',
    codeSnippet: `// Mission Script State Sequence
void executeMissionStep() {
  switch(currentStep) {
    case START_STAGE:
      moveForward(30);
      if (detectObstacle() < 10) currentStep = REACH_OBJECT;
      break;
    case REACH_OBJECT:
      openGripper();
      alignToTarget();
      closeGripperTight(85); // 85% grasp tension
      currentStep = RAMB_CLIMB;
      break;
    case RAMB_CLIMB:
      // Adjust speed by Pitch angle feedback to prevent tipping over
      float pitch = getPitchAngle();
      if (pitch > 15.0) {
        setDualPower(BOOST_SPEED, BOOST_SPEED);
      } else {
        setDualPower(NORMAL_SPEED, NORMAL_SPEED);
      }
      if (isRampCompleted()) currentStep = MISSION_COMPLETE;
      break;
  }
}`,
    simulateLogs: [
      { timestamp: '00:01.00', type: 'INFO', message: 'Mission controller online. Telemetry sync active.' },
      { timestamp: '00:01.35', type: 'INFO', message: 'MPU6050 Inertial Measurement Unit initialized.' },
      { timestamp: '00:02.15', type: 'SUCCESS', message: 'Gripper servo limits calibrated at [0deg - 120deg].' },
      { timestamp: '00:04.20', type: 'INFO', message: 'Ramp inclination check: +18.4 degrees. Core gyro-balancing active.' },
      { timestamp: '00:07.80', type: 'SUCCESS', message: 'Claw gripped payload successfully. Target state reached.' }
    ]
  },
  {
    id: 'portfolio-web',
    title: 'Robot Portfolio Web App',
    description: '나의 로봇 프로젝트를 소개하기 위해 만든 웹앱입니다.',
    image: '/src/assets/images/portfolio_app_1779515259402.png',
    techStack: ['Web Design', 'AI Tool, Portfolio', 'Design Design'],
    longDescription: '로봇 공학 및 소프트웨어 하드웨어 산출물을 조화롭고 시각적으로 압도하게 연출하는 "Futuristic Academic" 다크-클라이언트 웹앱입니다. 글래스모피즘(Glassmorphism) 설계 원칙, 네온 이펙트 셰이더 모방 CSS 기법, 실시간 자율 기동 로그 시뮬레이터를 담아내어 기술적 완성도를 어필하도록 개발되었습니다.',
    hardwareSpec: [
      { component: '개발 플랫폼', spec: 'Vite 6 + React 19 + TypeScript 5' },
      { component: '스타일링 프레임', spec: 'Tailwind CSS v4 (강력한 유틸 크기 제어)' },
      { component: '인터랙션', spec: 'Motion 라이브러리를 통한 시네마틱 트랜지션' },
      { component: '아이콘 리소스', spec: 'Lucide-React 완벽 통합' }
    ],
    softwareDetails: '반응형 그리드 디스플레이 모드, 가상 하드웨어 스펙 보드 로딩, 코드 조각 하이라이트 등 엔지니어링 미학의 극대화.',
    codeSnippet: `// React Adaptive UI Configuration
export default function PortfolioSection() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const filteredProjects = PROJECTS_DATA.filter(project => 
    !selectedTech || project.techStack.includes(selectedTech)
  );

  return (
    <div id="portfolio" className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {filteredProjects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onInspect={() => triggerInspectView(project)}
        />
      ))}
    </div>
  );
}`,
    simulateLogs: [
      { timestamp: '00:01.00', type: 'INFO', message: 'Starting virtual DOM and Vite dev thread.' },
      { timestamp: '00:01.25', type: 'SUCCESS', message: 'Tailwind CSS modules loaded successfully.' },
      { timestamp: '00:02.00', type: 'INFO', message: 'Preloaded 5 stunning AI-generated robotics illustrations.' },
      { timestamp: '00:02.80', type: 'SUCCESS', message: 'Render engine stabilized. Ready for interactive inspects.' }
    ]
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: 'exp1',
    year: '2026',
    title: '2026 RoboCup Korea Open: CoSpace Rescue U12',
    team: 'Team: K.F.C.SIRUS',
    role: 'WORLD 2 Programmer',
    description: '대한민국 국가대표 예선전을 거쳐 다양한 로봇 기술과 시뮬레이션 센서 튜닝 기법을 집대성했습니다.',
    detailedPoints: [
      'CoSpace Rescue 가상 환경 및 물리 엔진 기반 실시간 맵 탐색 펌웨어 작성.',
      '장애물 센서값 가중 결합을 통해 충돌 회피 정확성 15% 향상.',
      '센서 및 모터 칼리브레이션 튜닝을 통한 난코스(늪지대, 함정) 탈출 루틴 설계.',
      'Superteam 연합에서 우수한 코딩 리더쉽 발휘.'
    ]
  },
  {
    id: 'exp2',
    year: '2025',
    title: '2025 Robot Challenge: SUMO',
    role: 'Participant',
    description: '마찰계수와 하드웨어 차체 무게 중심의 세부 조정을 통해, 압도적인 기동성을 바탕으로 한 경기 능력을 발휘했습니다.',
    detailedPoints: [
      '차체 하부에 저중심 고속 배터리 마운트 레이아웃 설계.',
      '상대방 접근 속도와 방향을 삼각측량 기법으로 예측하는 고밀도 센서 스캔 알고리즘 적용.',
      '급커브 탈출 및 코너 선회 능력을 강화하기 위한 실리콘 휠 마찰 슬립 보정.',
      'SUMO 종목 최종 심사위원 평가 우수, 장려상 수상.'
    ]
  }
];

export const SKILLS_DATA: Skill[] = [
  { name: 'C Coding', category: 'Coding', proficiency: 85 },
  { name: 'Micro Python Coding', category: 'Coding', proficiency: 75 },
  { name: 'Block Coding', category: 'Coding', proficiency: 95 },
  { name: 'Robot Building', category: 'Engineering', proficiency: 90 },
  { name: 'Problem Solving', category: 'Methodology', proficiency: 88 },
  { name: 'Teamwork', category: 'Methodology', proficiency: 92 },
  { name: 'PPT Presentation', category: 'Methodology', proficiency: 80 },
  { name: 'Instruction Making', category: 'Methodology', proficiency: 85 }
];

export const AWARDS_DATA: Award[] = [
  {
    id: 'award-1',
    year: '2026',
    title: '2026 RoboCup Korea Open',
    category: 'CoSpace U12',
    rank: 'SUPERTEAM 1ST'
  },
  {
    id: 'award-2',
    year: '2025',
    title: '2025 ROBOTCHALLENGE',
    category: 'SUMO',
    rank: '장려상'
  }
];
