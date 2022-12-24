import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

import { useState } from 'react';
import { useRecoilState } from 'recoil';
import Datepicker from 'tailwind-datepicker-react';
import { endDateState, startDateState } from '../atoms/searchAtom';

const defaultOptions = {
	todayBtn: false,
	theme: {
		cursor: 'pointer',
		background: 'bg-gray-100 dark:bg-gray-500',
		todayBtn: 'bg-green-500',
		clearBtn: '',
		icons: '',
		text: 'text-gray-800 dark:text-gray-100',
		disabledText: 'text-gray-400 dark:text-gray-600',
		input: '',
		inputIcon: '',
		selected: 'bg-green-500'
	},
	icons: {
		prev: () => <ChevronLeftIcon className="h-5 w-5" />,
		next: () => <ChevronRightIcon className="h-5 w-5" />
	},
	language: 'en'
};

export default function MyDatePicker() {
	const [startShow, setStartShow] = useState(false);
	const [endShow, setEndShow] = useState(false);
	const [endDate, setEndDate] = useRecoilState(endDateState);
	const [startDate, setStartDate] = useRecoilState(startDateState);

	const handleStartDateChange = (selectedDate) => {
		setStartDate(endDate <= selectedDate ? endDate : selectedDate);
	};
	const handleEndDateChange = (selectedDate) => {
		setEndDate(startDate >= selectedDate ? startDate : selectedDate);
	};

	const handleStartClose = (state) => {
		setStartShow(state);
	};
	const handleEndClose = (state) => {
		setEndShow(state);
	};
	const startOptions = {
		title: 'Start Date',
		maxDate: endDate,
		defaultDate: startDate,
		...defaultOptions
	};
	const endOptions = {
		title: 'End Date',
		minDate: startDate,
		defaultDate: endDate,
		maxDate: new Date().setDate(new Date().getDate()),
		...defaultOptions
	};
	return (
		<div className="flex flex-col md:flex-row">
			<Datepicker
				options={startOptions}
				onChange={handleStartDateChange}
				show={startShow}
				setShow={handleStartClose}
			/>
			<Datepicker
				options={endOptions}
				onChange={handleEndDateChange}
				show={endShow}
				setShow={handleEndClose}
			/>
		</div>
	);
}
