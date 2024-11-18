import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import './TableAnimations.css'; // 애니메이션을 위한 CSS 파일 임포트

const getCancellationRateStyle = (rate) => {
  return rate > 50 ? { color: 'red', fontWeight: 'bold' } : {};
};

export const DailyStatisticsTable = ({ data }) => {
  return (
    <TableContainer
      component={Paper}
      style={{
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        style={{
          textAlign: 'center',
          margin: '10px 0',
          fontWeight: 'bold',
        }}
      >
        일별 추가 정보
      </Typography>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#f5f5f5' }}>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>전체 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>처리된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>취소된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 처리 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 취소 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>취소율</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow className="fade-in-row">
            <TableCell style={{ textAlign: 'center' }}>{data.totalWaitingCount}건</TableCell>
            <TableCell style={{ textAlign: 'center' }}>{data.completedCount}건</TableCell>
            <TableCell style={{ textAlign: 'center' }}>{data.canceledCount}건</TableCell>
            <TableCell style={{ textAlign: 'center' }}>
              {data.completedAverageWaitingTime}분
            </TableCell>
            <TableCell style={{ textAlign: 'center' }}>
              {data.canceledAverageWaitingTime}분
            </TableCell>
            <TableCell
              style={{
                textAlign: 'center',
                ...getCancellationRateStyle(data.cancellationRate),
              }}
            >
              {data.cancellationRate}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 시간별 테이블
export const HourlyStatisticsTable = ({ data }) => {
  return (
    <TableContainer
      component={Paper}
      style={{
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        style={{
          textAlign: 'center',
          margin: '10px 0',
          fontWeight: 'bold',
        }}
      >
        시간별 추가 정보
      </Typography>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#f5f5f5' }}>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>전체 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>처리된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>취소된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>최대 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>최소 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 입장 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 취소 대기 시간</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="fade-in-row">
              <TableCell style={{ textAlign: 'center' }}>{item.hour}</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.totalWaitingCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.completedCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.canceledCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.maxWaitingTime}분</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.minWaitingTime}분</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.completedAverageWaitingTime}분</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.canceledAverageWaitingTime}분</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 월별 테이블
export const MonthlyStatisticsTable = ({ data }) => {
  return (
    <TableContainer
      component={Paper}
      style={{
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        style={{
          textAlign: 'center',
          margin: '10px 0',
          fontWeight: 'bold',
        }}
      >
        월별 상세 정보
      </Typography>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#f5f5f5' }}>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>날짜</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>처리된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>취소된 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>전체 웨이팅 수</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 입장 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>평균 취소 대기 시간</TableCell>
            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>취소율</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="fade-in-row">
              <TableCell style={{ textAlign: 'center' }}>{item.date}</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.completedCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.canceledCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.totalWaitingCount}건</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.completedAverageWaitingTime}분</TableCell>
              <TableCell style={{ textAlign: 'center' }}>{item.canceledAverageWaitingTime}분</TableCell>
              <TableCell
                style={{
                  textAlign: 'center',
                  ...getCancellationRateStyle(item.cancellationRate),
                }}
              >
                {item.cancellationRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
