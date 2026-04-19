#include<bits/stdc++.h>
using namespace std;
int sub(vector<int>& a,int goal)
    {
        if(goal < 0) return 0;
        int l = 0 , r = 0 , c = 0 , s = 0;
        while(r < a.size())
        {
            s += a[r];
            while(s > goal)
            {
                s -= a[l];
                l++;
            }
            c += (r - l + 1);
            r++;
        }
        return c;
    }
int numSubarray(vector<int>& a, int goal) {
        return sub(a,goal) - sub(a,goal-1);
    }


int main()
{
    int n;
    cin>>n;
    vector<int> a(n);
    for(int i = 0 ; i < n ; i++) cin>>a[i];

    int goal;

    cout<<"Enter Goal : ";
    cin>>goal;

    cout<<"Count of Bnary Subarray : "<<numSubarray(a,goal);
}