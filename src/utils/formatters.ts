export const formatCurrency = (amount: number, prefix: string = 'Rs.'): string => {
  return `${prefix} ${Math.round(amount).toLocaleString('en-US')}`;
};

export const formatLKR = (amount: number): string => {
  return `LKR ${Math.round(amount).toLocaleString('en-US')}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr;
};

export const getTimeLeftString = (returnDate: string, returnTime: string): { text: string; isOverdue: boolean } => {
  try {
    const target = new Date(`${returnDate}T${returnTime}:00`);
    const now = new Date();
    // Default fallback to 2026-10-03 current simulation if target date matches
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs < 0) {
      const overMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));
      const hours = Math.floor(overMinutes / 60);
      const mins = overMinutes % 60;
      return {
        text: hours > 0 ? `${hours}h ${mins}m overdue` : `${mins}m overdue`,
        isOverdue: true,
      };
    } else {
      const remainingMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      return {
        text: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
        isOverdue: false,
      };
    }
  } catch {
    return { text: 'On time', isOverdue: false };
  }
};

export const getDocumentExpiryStatus = (
  expiryDateStr: string,
  referenceDateStr: string = '2026-10-03'
): {
  daysRemaining: number;
  isWarning: boolean;
  isExpired: boolean;
  statusText: string;
} => {
  if (!expiryDateStr) {
    return { daysRemaining: 999, isWarning: false, isExpired: false, statusText: 'Not set' };
  }
  try {
    const expiry = new Date(expiryDateStr);
    const ref = new Date(referenceDateStr);
    const diffTime = expiry.getTime() - ref.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isExpired = daysRemaining <= 0;
    const isWarning = daysRemaining <= 30;

    let statusText = `${daysRemaining} days left`;
    if (isExpired) {
      statusText = daysRemaining === 0 ? 'Expires today' : `Expired ${Math.abs(daysRemaining)}d ago`;
    } else if (daysRemaining <= 30) {
      statusText = `Expires in ${daysRemaining} days!`;
    }

    return { daysRemaining, isWarning, isExpired, statusText };
  } catch {
    return { daysRemaining: 999, isWarning: false, isExpired: false, statusText: 'Invalid date' };
  }
};

export const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  };

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
