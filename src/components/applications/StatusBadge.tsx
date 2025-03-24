
import { Badge } from "@/components/ui/badge";

type StatusType = 'new' | 'in-review' | 'accepted' | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch(status) {
    case 'accepted':
      return <Badge variant="success">Accepted</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'in-review':
      return <Badge variant="warning">In Review</Badge>;
    case 'new':
    default:
      return <Badge variant="default">New</Badge>;
  }
};

export default StatusBadge;
