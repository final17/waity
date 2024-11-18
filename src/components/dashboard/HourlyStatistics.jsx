import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { RotatingLines } from 'react-loader-spinner';
import { API_ENDPOINTS, fetchGET } from '../../constants/api';
import { toast } from 'react-toastify';
import { HourlyStatisticsTable } from './StatisticsTable';

const HourlyStatistics = ({ storeId }) => {
  const [date, setDate] = useState('');
  const [hourlyCategories, setHourlyCategories] = useState([]);
  const [completedSeries, setCompletedSeries] = useState([]);
  const [canceledSeries, setCanceledSeries] = useState([]);
  const [totalSeries, setTotalSeries] = useState([]);
  const [maxWaitTimeSeries, setMaxWaitTimeSeries] = useState([]);
  const [minWaitTimeSeries, setMinWaitTimeSeries] = useState([]);
  const [avgCompletedWaitTimeSeries, setAvgCompletedWaitTimeSeries] = useState([]);
  const [avgCanceledWaitTimeSeries, setAvgCanceledWaitTimeSeries] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataAvailable, setDataAvailable] = useState(false);

  const handleDateChange = (newDate) => {
    if (newDate === date) {
      toast.info('이미 선택된 날짜입니다.');
      return;
    }
    setDate(newDate);
  };

  useEffect(() => {
    if (!date) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = `${yesterday.getFullYear()}-${String(
        yesterday.getMonth() + 1
      ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      setDate(formattedDate);
    } else {
      fetchHourlyStatistics();
    }
  }, [date]);

  const fetchHourlyStatistics = async () => {
    setLoading(true);
    resetData();
  
    try {
      const response = await fetchGET(API_ENDPOINTS.waiting.statistics.hourly(storeId), {
        params: { date },
      });
  
      if (response.status === 200) {
        const data = response.data || [];
        if (data.length === 0) {
          setDataAvailable(false);
          setLoading(false);
          return;
        }
  
        setDataAvailable(true);
  
        const completedCounts = data.map((hour) => hour.completedCount || 0);
        const canceledCounts = data.map((hour) => hour.canceledCount || 0);
        const totalCounts = data.map((hour) => hour.totalWaitingCount || 0);
        const maxWaitTimes = data.map((hour) => hour.maxWaitingTime || 0);
        const minWaitTimes = data.map((hour) => hour.minWaitingTime || 0);
        const avgCompletedWaitTimes = data.map((hour) => hour.completedAverageWaitingTime || 0);
        const avgCanceledWaitTimes = data.map((hour) => hour.canceledAverageWaitingTime || 0);
  
        const categories = data.map((hour) => `${hour.hour}시`);
        setHourlyCategories(categories);
  
        setCompletedSeries(completedCounts);
        setCanceledSeries(canceledCounts);
        setTotalSeries(totalCounts);
        setMaxWaitTimeSeries(maxWaitTimes);
        setMinWaitTimeSeries(minWaitTimes);
        setAvgCompletedWaitTimeSeries(avgCompletedWaitTimes);
        setAvgCanceledWaitTimeSeries(avgCanceledWaitTimes);
  
        setAdditionalInfo(
          data.map((hour) => ({
            hour: `${hour.hour}시`,
            totalWaitingCount: hour.totalWaitingCount || 0,
            completedCount: hour.completedCount || 0, // 처리된 웨이팅 수 추가
            canceledCount: hour.canceledCount || 0, // 취소된 웨이팅 수 추가
            maxWaitingTime: hour.maxWaitingTime || 0,
            minWaitingTime: hour.minWaitingTime || 0,
            completedAverageWaitingTime: hour.completedAverageWaitingTime || 0,
            canceledAverageWaitingTime: hour.canceledAverageWaitingTime || 0,
          }))
        );
      } else {
        setDataAvailable(false);
        toast.info('선택된 날짜에 대한 데이터가 없습니다.');
      }
    } catch (error) {
      setDataAvailable(false);
      toast.error('시간대별 통계를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setHourlyCategories([]);
    setCompletedSeries([]);
    setCanceledSeries([]);
    setTotalSeries([]);
    setMaxWaitTimeSeries([]);
    setMinWaitTimeSeries([]);
    setAvgCompletedWaitTimeSeries([]);
    setAvgCanceledWaitTimeSeries([]);
    setAdditionalInfo([]);
  };

  const generateChartOptions = (title, series, color, unit) => ({
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) =>
        params.map((item) => {
          let value = item.value;
          if (unit === '%') value += '%';
          else if (unit === '분') value += '분';
          else value += '건';
          return `${item.marker} ${item.seriesName}: ${value}`;
        }).join('<br>'),
    },
    xAxis: {
      type: 'category',
      data: hourlyCategories,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          if (unit === '%') return `${value}%`;
          if (unit === '분') return `${value}분`;
          return `${value}건`;
        },
      },
    },
    series: [
      {
        data: series,
        type: 'bar',
        itemStyle: { color },
      },
    ],
  });
  
  const generateCombinedChartOptions = () => ({
    title: {
      text: `통합 그래프 (${date})`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) =>
        params.map((item) => {
          let value = item.value;
          if (item.seriesName.includes('시간')) value += '분';
          else if (item.seriesName.includes('수')) value += '건';
          return `${item.marker} ${item.seriesName}: ${value}`;
        }).join('<br>'),
    },
    legend: {
      data: [
        '전체 웨이팅 수',
        '입장 완료된 웨이팅 수',
        '취소된 웨이팅 수',
        '최대 대기 시간',
        '평균 입장 대기 시간',
        '최소 대기 시간',
        '평균 취소 대기 시간',
      ],
      top: '5%',
    },
    grid: {
      top: '20%',
      bottom: '25%',
      left: '10%',
      right: '10%',
    },
    xAxis: {
      type: 'category',
      data: hourlyCategories,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '값',
      axisLabel: {
        formatter: (value) => `${value}`,
      },
    },
    series: [
      {
        name: '전체 웨이팅 수',
        type: 'line',
        data: totalSeries,
        smooth: true,
        lineStyle: { width: 2, color: '#FFC107' },
      },
      {
        name: '입장 완료된 웨이팅 수',
        type: 'line',
        data: completedSeries,
        smooth: true,
        lineStyle: { width: 2, color: '#4CAF50' },
      },
      {
        name: '취소된 웨이팅 수',
        type: 'line',
        data: canceledSeries,
        smooth: true,
        lineStyle: { width: 2, color: '#FF5252' },
      },
      {
        name: '최대 대기 시간',
        type: 'line',
        data: maxWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 1.5, color: '#008FFB' },
      },
      {
        name: '평균 입장 대기 시간',
        type: 'line',
        data: avgCompletedWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 1.5, color: '#00E396' },
      },
      {
        name: '최소 대기 시간',
        type: 'line',
        data: minWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 1.5, color: '#FEB019' },
      },
      {
        name: '평균 취소 대기 시간',
        type: 'line',
        data: avgCanceledWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 1.5, color: '#FF4560' },
      },
    ],
  });
  
  
  

  return (
    <div className="responsive-chart-container">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
          날짜 선택
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>


      {/* 로딩 스피너 */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <RotatingLines width="100" strokeColor="#4CAF50" />
        </div>
      )}

      {/* 데이터 없음 메시지 */}
      {!loading && !dataAvailable && (
        <div className="text-center text-gray-500 py-10">
          선택된 날짜에 대한 통계 데이터가 없습니다.
        </div>
      )}
      
        {/* 통합 그래프 */}
        {!loading && dataAvailable && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateCombinedChartOptions()}
            style={{ width: '100%', height: '400px' }}
            />
        </div>
        )}

        {/* 개별 막대 그래프들 */}
        {!loading && dataAvailable && totalSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('전체 웨이팅 수', totalSeries, '#FFC107', '건')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && completedSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('입장 완료된 웨이팅 수', completedSeries, '#4CAF50', '건')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && canceledSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('취소된 웨이팅 수', canceledSeries, '#FF5252', '건')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && maxWaitTimeSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('최대 대기 시간', maxWaitTimeSeries, '#008FFB', '분')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && minWaitTimeSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('최소 대기 시간', minWaitTimeSeries, '#FEB019', '분')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && avgCompletedWaitTimeSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('평균 입장 대기 시간', avgCompletedWaitTimeSeries, '#00E396', '분')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}
        {!loading && dataAvailable && avgCanceledWaitTimeSeries.length > 0 && (
        <div className="chart-wrapper mb-6">
            <ReactECharts
            option={generateChartOptions('평균 취소 대기 시간', avgCanceledWaitTimeSeries, '#FF4560', '분')}
            style={{ width: '100%', height: '300px' }}
            />
        </div>
        )}


      {/* 추가 정보 테이블 */}
      {!loading && dataAvailable && additionalInfo.length > 0 && (
        <HourlyStatisticsTable data={additionalInfo} />
      )}
    </div>
  );
};

export default HourlyStatistics;
