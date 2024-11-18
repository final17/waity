import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { RotatingLines } from 'react-loader-spinner';
import { API_ENDPOINTS, fetchGET } from '../../constants/api';
import { toast } from 'react-toastify';
import { DailyStatisticsTable } from './StatisticsTable';

const DailyStatistics = ({ storeId }) => {
  const [date, setDate] = useState('');
  const [dailyCategories, setDailyCategories] = useState([]);
  const [completedSeries, setCompletedSeries] = useState([]);
  const [canceledSeries, setCanceledSeries] = useState([]);
  const [totalSeries, setTotalSeries] = useState([]);
  const [avgCompletedWaitTimeSeries, setAvgCompletedWaitTimeSeries] = useState([]);
  const [avgCanceledWaitTimeSeries, setAvgCanceledWaitTimeSeries] = useState([]);
  const [cancellationRateSeries, setCancellationRateSeries] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataAvailable, setDataAvailable] = useState(false);

  useEffect(() => {
    if (!date) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const defaultDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      setDate(defaultDate);
    } else {
      fetchDailyStatistics();
    }
  }, [date]);

  const fetchDailyStatistics = async () => {
    setLoading(true);
    resetData();

    try {
      const response = await fetchGET(API_ENDPOINTS.waiting.statistics.daily(storeId), {
        params: { date },
      });

      if (response.status === 200) {
        const data = response.data || {};
        if (!data.totalWaitingCount) {
          setDataAvailable(false);
          toast.info('선택된 날짜에 대한 데이터가 없습니다.');
          setLoading(false);
          return;
        }

        setDataAvailable(true);

        const categories = [date];
        const completedCounts = [data.completedCount];
        const canceledCounts = [data.canceledCount];
        const totalCounts = [data.totalWaitingCount];
        const avgCompletedWaitTimes = [data.completedAverageWaitingTime];
        const avgCanceledWaitTimes = [data.canceledAverageWaitingTime];
        const cancellationRates = [data.cancellationRate];

        setDailyCategories(categories);
        setCompletedSeries(completedCounts);
        setCanceledSeries(canceledCounts);
        setTotalSeries(totalCounts);
        setAvgCompletedWaitTimeSeries(avgCompletedWaitTimes);
        setAvgCanceledWaitTimeSeries(avgCanceledWaitTimes);
        setCancellationRateSeries(cancellationRates);

        setAdditionalInfo({
          totalWaitingCount: data.totalWaitingCount,
          completedCount: data.completedCount,
          canceledCount: data.canceledCount,
          completedAverageWaitingTime: `${data.completedAverageWaitingTime.toFixed(2)}`,
          canceledAverageWaitingTime: `${data.canceledAverageWaitingTime.toFixed(2)}`,
          cancellationRate: `${data.cancellationRate.toFixed(2)}`,
        });
      } else {
        setDataAvailable(false);
        toast.info('선택된 날짜에 대한 데이터가 없습니다.');
      }
    } catch (error) {
      setDataAvailable(false);
      toast.error('일별 통계를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setDailyCategories([]);
    setCompletedSeries([]);
    setCanceledSeries([]);
    setTotalSeries([]);
    setAvgCompletedWaitTimeSeries([]);
    setAvgCanceledWaitTimeSeries([]);
    setCancellationRateSeries([]);
    setAdditionalInfo(null);
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
      data: dailyCategories,
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
      text: `${date.replace('-', '년 ').replace('-', '월 ')}일 통합 웨이팅 통계`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return params
          .map((item) => {
            let value = item.value;
            if (item.seriesName.includes('취소율')) value += '%';
            else if (item.seriesName.includes('시간')) value += '분';
            else value += '건';
            return `${item.marker} ${item.seriesName}: ${value}`;
          })
          .join('<br>');
      },
    },
    legend: {
      data: [
        '처리된 웨이팅 수',
        '취소된 웨이팅 수',
        '전체 웨이팅 수',
        '평균 처리 대기 시간',
        '평균 취소 대기 시간',
        '취소율',
      ],
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: dailyCategories,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '처리된 웨이팅 수',
        type: 'bar',
        data: completedSeries,
        itemStyle: { color: '#4CAF50' },
      },
      {
        name: '취소된 웨이팅 수',
        type: 'bar',
        data: canceledSeries,
        itemStyle: { color: '#FF5252' },
      },
      {
        name: '전체 웨이팅 수',
        type: 'bar',
        data: totalSeries,
        itemStyle: { color: '#FFC107' },
      },
      {
        name: '평균 처리 대기 시간',
        type: 'bar',
        data: avgCompletedWaitTimeSeries,
        itemStyle: { color: '#42A5F5' },
      },
      {
        name: '평균 취소 대기 시간',
        type: 'bar',
        data: avgCanceledWaitTimeSeries,
        itemStyle: { color: '#FF7043' },
      },
      {
        name: '취소율',
        type: 'bar',
        data: cancellationRateSeries,
        itemStyle: { color: '#AB47BC' },
      },
    ],
  });

  return (
    <div>
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
        <div className="mb-6">
          <ReactECharts option={generateCombinedChartOptions()} />
        </div>
      )}
  
      {/* 개별 그래프 */}
      {!loading && dataAvailable && (
        <>
          <div className="mb-6">
            <ReactECharts option={generateChartOptions(`전체 웨이팅 수 (${date})`, totalSeries, '#FFC107', '건')} />
          </div>
          <div className="mb-6">
            <ReactECharts option={generateChartOptions(`처리된 웨이팅 수 (${date})`, completedSeries, '#4CAF50', '건')} />
          </div>
          <div className="mb-6">
            <ReactECharts option={generateChartOptions(`취소된 웨이팅 수 (${date})`, canceledSeries, '#FF5252', '건')} />
          </div>
          <div className="mb-6">
            <ReactECharts
              option={generateChartOptions(`평균 처리 대기 시간 (${date})`, avgCompletedWaitTimeSeries, '#42A5F5', '분')}
            />
          </div>
          <div className="mb-6">
            <ReactECharts
              option={generateChartOptions(`평균 취소 대기 시간 (${date})`, avgCanceledWaitTimeSeries, '#FF7043', '분')}
            />
          </div>
          <div className="mb-6">
            <ReactECharts
              option={generateChartOptions(`취소율 (${date})`, cancellationRateSeries, '#AB47BC', '%')}
            />
          </div>
        </>
      )}
  
      {/* 추가 정보 테이블 */}
      {!loading && dataAvailable && additionalInfo && (
        <DailyStatisticsTable data={additionalInfo} />
      )}
    </div>
  );
};

export default DailyStatistics;
