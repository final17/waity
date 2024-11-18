import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { RotatingLines } from 'react-loader-spinner';
import { API_ENDPOINTS, fetchGET } from '../../constants/api';
import { toast } from 'react-toastify';
import { MonthlyStatisticsTable } from './StatisticsTable';

const MonthlyStatistics = ({ storeId }) => {
  const [yearMonth, setYearMonth] = useState('');
  const [dailyStats, setDailyStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [completedSeries, setCompletedSeries] = useState([]);
  const [canceledSeries, setCanceledSeries] = useState([]);
  const [totalSeries, setTotalSeries] = useState([]);
  const [maxWaitTimeSeries, setMaxWaitTimeSeries] = useState([]);
  const [minWaitTimeSeries, setMinWaitTimeSeries] = useState([]);
  const [averageData, setAverageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataAvailable, setDataAvailable] = useState(false);

  useEffect(() => {
    if (!yearMonth) {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setYearMonth(currentYearMonth);
    } else {
      fetchMonthlyStatistics();
    }
  }, [yearMonth]);

  const fetchMonthlyStatistics = async () => {
    setLoading(true);
    resetData();
  
    try {
      const response = await fetchGET(API_ENDPOINTS.waiting.statistics.monthly(storeId), {
        params: { month: yearMonth },
      });
  
      if (response.status === 200) {
        const data = response.data || {};
        if (!data.dailyStatistics || Object.keys(data.dailyStatistics).length === 0) {
          setDataAvailable(false);
          toast.info('선택된 달에 대한 데이터가 없습니다.');
          setLoading(false);
          return;
        }
  
        setDataAvailable(true);
  
        const dailyStatsArray = Object.entries(data.dailyStatistics).map(([date, stats]) => ({
          date,
          ...stats,
        }));
  
        // 날짜에서 "일"만 추출
        const categories = dailyStatsArray.map((stat) => {
          const date = new Date(stat.date);
          return `${date.getDate()}일`; // "일"만 추출
        });
  
        const completedCounts = dailyStatsArray.map((stat) => stat.completedCount || 0);
        const canceledCounts = dailyStatsArray.map((stat) => stat.canceledCount || 0);
        const totalCounts = dailyStatsArray.map((stat) => stat.totalWaitingCount || 0);
        const maxWaitTimes = dailyStatsArray.map((stat) => stat.maxWaitTime || 0);
        const minWaitTimes = dailyStatsArray.map((stat) => stat.minWaitTime || 0);
  
        // Calculate averages
        const totalCompleted = completedCounts.reduce((sum, value) => sum + value, 0);
        const totalCanceled = canceledCounts.reduce((sum, value) => sum + value, 0);
        const totalWaiting = totalCounts.reduce((sum, value) => sum + value, 0);
        const daysCount = dailyStatsArray.length;
  
        setAverageData({
          avgCompletedWaitTime: data.avgCompletedWaitTime || 0,
          avgCanceledWaitTime: data.avgCanceledWaitTime || 0,
          avgWaitingCount: (totalWaiting / daysCount).toFixed(2),
          avgCompletedCount: (totalCompleted / daysCount).toFixed(2),
          avgCanceledCount: (totalCanceled / daysCount).toFixed(2),
          avgCancelRate: ((totalCanceled / totalWaiting) * 100).toFixed(2) || 0,
        });
  
        setDailyStats(dailyStatsArray);
        setCategories(categories);
        setCompletedSeries(completedCounts);
        setCanceledSeries(canceledCounts);
        setTotalSeries(totalCounts);
        setMaxWaitTimeSeries(maxWaitTimes);
        setMinWaitTimeSeries(minWaitTimes);
      } else {
        setDataAvailable(false);
        toast.info('선택된 달에 대한 데이터가 없습니다.');
      }
    } catch (error) {
      setDataAvailable(false);
      toast.error('월별 통계를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setDailyStats([]);
    setCategories([]);
    setCompletedSeries([]);
    setCanceledSeries([]);
    setTotalSeries([]);
    setMaxWaitTimeSeries([]);
    setMinWaitTimeSeries([]);
    setAverageData({});
  };

  const generateLineChartOptions = () => ({
    title: {
      text: `${yearMonth.replace('-', '년 ')}월 통합 웨이팅 통계`,
      left: 'center',
      top: '0%',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const formatUnit = {
          '전체 웨이팅 수': '건',
          '처리된 웨이팅 수': '건',
          '취소된 웨이팅 수': '건',
          '최대 대기 시간': '분',
          '최소 대기 시간': '분',
        };
        return params
          .map(
            (p) => `${p.marker} ${p.seriesName}: ${p.value} ${formatUnit[p.seriesName] || ''}`
          )
          .join('<br/>');
      },
    },
    grid: {
      top: '20%',
      bottom: '25%',
      left: '10%',
      right: '10%',
    },
    legend: {
      data: [
        '전체 웨이팅 수',
        '처리된 웨이팅 수',
        '취소된 웨이팅 수',
        '최대 대기 시간',
        '최소 대기 시간',
      ],
      top: '5%',
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        formatter: (value) => `${value}`, // X축 라벨에 "일" 추가
        rotate: 0, // 라벨 기울기 설정
        fontSize: 12, // 글씨 크기 조정
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '수량(건)',
        position: 'left',
        axisLabel: {
          formatter: '{value} 건',
        },
      },
      {
        type: 'value',
        name: '시간(분)',
        position: 'right',
        axisLabel: {
          formatter: '{value} 분',
        },
      },
    ],
    series: [
      {
        name: '전체 웨이팅 수',
        type: 'line',
        data: totalSeries,
        smooth: true,
        lineStyle: { width: 2 },
        yAxisIndex: 0,
      },
      {
        name: '처리된 웨이팅 수',
        type: 'line',
        data: completedSeries,
        smooth: true,
        lineStyle: { width: 2 },
        yAxisIndex: 0,
      },
      {
        name: '취소된 웨이팅 수',
        type: 'line',
        data: canceledSeries,
        smooth: true,
        lineStyle: { width: 2 },
        yAxisIndex: 0,
      },
      {
        name: '최대 대기 시간',
        type: 'line',
        data: maxWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 2 },
        yAxisIndex: 1,
      },
      {
        name: '최소 대기 시간',
        type: 'line',
        data: minWaitTimeSeries,
        smooth: true,
        lineStyle: { width: 2 },
        yAxisIndex: 1,
      },
    ],
  });
  
  const generateBarChartOptions = (title, series, color, unit) => ({
    title: {
      text: title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => params.map(
        (p) => `${p.marker} ${p.seriesName}: ${p.value} ${unit || ''}`
      ).join('<br/>'),
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: unit,
      axisLabel: {
        formatter: `{value} ${unit}`,
      },
    },
    series: [
      {
        data: series,
        type: 'bar',
        itemStyle: { color },
        label: {
          show: true,
          position: 'top',
          formatter: `{c} ${unit}`,
        },
      },
    ],
  });
  
  const generateAverageChartOptions = () => ({
    title: {
      text: `${yearMonth.replace('-', '년 ')}월 평균 통계`,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const units = ['분', '분', '건', '건', '건', '%'];
        const { name, value, dataIndex } = params;
        const unit = units[dataIndex] || '';
        return `${name}: ${value} ${unit}`;
      },
    },
    xAxis: {
      type: 'category',
      data: [
        '입장 대기 시간',
        '취소 대기 시간',
        '웨이팅 수',
        '웨이팅 완료',
        '웨이팅 취소',
        '웨이팅 취소율',
      ],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '월 평균 통계',
        type: 'bar',
        data: [
          averageData.avgCompletedWaitTime,
          averageData.avgCanceledWaitTime,
          averageData.avgWaitingCount,
          averageData.avgCompletedCount,
          averageData.avgCanceledCount,
          averageData.avgCancelRate,
        ],
        itemStyle: { color: '#42A5F5' },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            const units = ['분', '분', '건', '건', '건', '%'];
            const unit = units[params.dataIndex] || '';
            return `${params.value} ${unit}`;
          },
        },
      },
    ],
  });
  
  return (
    <div className="responsive-chart-container">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yearMonth">
          월 선택
        </label>
        <input
          type="month"
          id="yearMonth"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
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
          선택된 달에 대한 통계 데이터가 없습니다.
        </div>
      )}
  
      {/* 통합 선형 그래프 */}
      {!loading && dataAvailable && (
        <div className="chart-wrapper mb-6">
          <ReactECharts
            option={generateLineChartOptions()}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      )}
  
      {/* 개별 막대 그래프 */}
      {!loading && dataAvailable && (
        <>
          <div className="chart-wrapper mb-6">
            <ReactECharts
              option={generateBarChartOptions('전체 웨이팅 수', totalSeries, '#FFC107', '건')}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <div className="chart-wrapper mb-6">
            <ReactECharts
              option={generateBarChartOptions('처리된 웨이팅 수', completedSeries, '#4CAF50', '건')}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <div className="chart-wrapper mb-6">
            <ReactECharts
              option={generateBarChartOptions('취소된 웨이팅 수', canceledSeries, '#FF5252', '건')}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <div className="chart-wrapper mb-6">
            <ReactECharts
              option={generateBarChartOptions('최대 대기 시간', maxWaitTimeSeries, '#42A5F5', '분')}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
          <div className="chart-wrapper mb-6">
            <ReactECharts
              option={generateBarChartOptions('최소 대기 시간', minWaitTimeSeries, '#FFB74D', '분')}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
        </>
      )}
  
      {/* 평균 통계 그래프 */}
      {!loading && dataAvailable && (
        <div className="chart-wrapper mb-6">
          <ReactECharts
            option={generateAverageChartOptions()}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      )}
  
      {/* 일별 테이블 */}
      {!loading && dataAvailable && dailyStats.length > 0 && (
        <MonthlyStatisticsTable data={dailyStats} />
      )}
    </div>
  );
  
};

export default MonthlyStatistics;
